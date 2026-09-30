"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Radio,
  ClipboardList,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import ManagerStatCard from "./ManagerStatCard";
import { api } from "@/lib/api";

export default function ManagerStats() {
  const [counts, setCounts] = useState({
    totalStaff: 0,
    activeShifts: 0,
    openDuties: 0,
    criticalOutages: 0,
    totalZones: 0,
    operationalZones: 0,
    totalStaffHours: 0,
    loaded: false,
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
      try {
        const [analyticsRes, staffRes, dutiesRes, zonesRes] = await Promise.allSettled([
          api<{ success: boolean; data?: any }>("/reports/analytics"),
          api<{ success: boolean; data?: any[]; pagination?: { total?: number } }>("/users/staff"),
          api<{ success: boolean; data?: any[]; pagination?: { total?: number } }>("/assignments"),
          api<{ success: boolean; data?: any[]; pagination?: { total?: number } }>("/zones"),
        ]);

        let staffCount = 0;
        let activeShiftsCount = 0;
        let dutyCount = 0;
        let criticalCount = 0;
        let zoneCount = 0;
        let operationalZoneCount = 0;
        let staffHours = 0;

        if (analyticsRes.status === "fulfilled" && analyticsRes.value?.data) {
          const d = analyticsRes.value.data;
          staffCount = d.totalStaff || 0;
          activeShiftsCount = d.activeShifts || 0;
          dutyCount = d.totalDutiesToday || 0;
          criticalCount = d.criticalOutages || 0;
          zoneCount = d.totalZones || 0;
          operationalZoneCount = d.operationalZones || 0;
          staffHours = d.totalStaffHours || 0;
        }

        if (staffRes.status === "fulfilled" && staffRes.value) {
          const s = staffRes.value.pagination?.total ?? (Array.isArray(staffRes.value.data) ? staffRes.value.data.length : 0);
          if (!staffCount) staffCount = s;
        }

        if (dutiesRes.status === "fulfilled" && dutiesRes.value) {
          const dList = Array.isArray(dutiesRes.value.data) ? dutiesRes.value.data : [];
          if (!dutyCount) dutyCount = dList.length;
          if (!criticalCount) {
            criticalCount = dList.filter((duty: any) => duty.priority === "CRITICAL_OUTAGE" && duty.status !== "COMPLETED").length;
          }
        }

        if (zonesRes.status === "fulfilled" && zonesRes.value) {
          const zList = Array.isArray(zonesRes.value.data) ? zonesRes.value.data : [];
          if (!zoneCount) zoneCount = zList.length;
          if (!operationalZoneCount) {
            operationalZoneCount = zList.filter((z: any) => z.status === "OPERATIONAL").length;
          }
        }

        if (isMounted) {
          setCounts({
            totalStaff: staffCount,
            activeShifts: activeShiftsCount,
            openDuties: dutyCount,
            criticalOutages: criticalCount,
            totalZones: zoneCount,
            operationalZones: operationalZoneCount,
            totalStaffHours: staffHours,
            loaded: true,
          });
        }
      } catch (err) {
        console.warn("Could not fetch live manager stats", err);
      }
    }

    fetchStats();
    const interval = setInterval(fetchStats, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const stats = [
    {
      label: "Field Technicians",
      value: counts.loaded ? String(counts.totalStaff) : "...",
      icon: Users,
      description: `${counts.activeShifts} on active shift right now`,
      trend: "Online",
    },
    {
      label: "Active Work Orders",
      value: counts.loaded ? String(counts.openDuties) : "...",
      icon: ClipboardList,
      description: "Line repairs, fiber splicing & installs",
    },
    {
      label: "Network Zones",
      value: counts.loaded ? `${counts.operationalZones}/${counts.totalZones || 3}` : "...",
      icon: Radio,
      description: "Distribution nodes & fiber sectors",
      trend: "Active",
    },
    {
      label: "Critical Outages",
      value: counts.loaded ? String(counts.criticalOutages) : "...",
      icon: AlertTriangle,
      description: counts.criticalOutages > 0 ? "Requires emergency linesman dispatch" : "All fiber nodes operating normal",
      isCritical: counts.criticalOutages > 0,
    },
  ];

  return (
    <section aria-labelledby="manager-stats-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 id="manager-stats-heading" className="text-base font-bold text-white">
            Operations & Field Crew Status
          </h2>
          <p className="text-xs text-slate-400">
            Real-time telemetry and technician deployment metrics
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 text-xs font-semibold text-sky-400">
          <Clock size={14} />
          <span>{counts.totalStaffHours} Shift Hrs Logged</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <ManagerStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            description={stat.description}
            trend={stat.trend}
            isCritical={stat.isCritical}
          />
        ))}
      </div>
    </section>
  );
}