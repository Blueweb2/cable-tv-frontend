"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  Radio,
  User,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAssignments } from "@/lib/assignment.api";
import type { Assignment } from "@/types/assignment";

export default function ActiveDutiesFeed() {
  const { token } = useAuth();
  const [duties, setDuties] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDuties() {
      if (!token) return;
      try {
        const res = await getAssignments(token, { limit: 6 });
        if (isMounted) {
          setDuties(res.data || []);
        }
      } catch (err) {
        console.warn("Error loading active field duties:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDuties();
    const interval = setInterval(loadDuties, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token]);

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "CRITICAL_OUTAGE":
        return (
          <span className="flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400">
            <AlertTriangle size={11} />
            CRITICAL OUTAGE
          </span>
        );
      case "HIGH":
        return (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
            HIGH PRIORITY
          </span>
        );
      default:
        return (
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400">
            STANDARD
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "IN_PROGRESS":
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            In Progress
          </span>
        );
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold text-sky-400">
            <CheckCircle2 size={12} />
            Completed
          </span>
        );
      case "ACCEPTED":
        return <span className="text-[11px] font-semibold text-amber-400">Accepted</span>;
      default:
        return <span className="text-[11px] font-semibold text-slate-400">Assigned</span>;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/70 p-5 shadow-xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ClipboardList className="text-[#00d2ff]" size={20} />
            Active Field Work Orders & Repairs
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Live technician duty status, cable complaints, and line maintenance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/manager/duties"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:from-sky-500 hover:to-cyan-500"
          >
            <Plus size={15} />
            Assign Work Order
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">
          <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          Loading field jobs telemetry...
        </div>
      ) : duties.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">
          <p>No active work orders right now.</p>
          <Link
            href="/manager/duties"
            className="mt-2 inline-block text-sky-400 hover:underline font-semibold"
          >
            Create first field assignment →
          </Link>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-slate-800/80">
          {duties.map((duty) => {
            const staffName =
              typeof duty.staff === "object" && duty.staff ? duty.staff.name : "Unassigned";
            const staffPhone =
              typeof duty.staff === "object" && duty.staff ? duty.staff.phone : "";

            return (
              <div
                key={duty._id}
                className="flex flex-col gap-3 py-3.5 transition hover:bg-slate-800/30 rounded-xl px-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                    <Radio size={18} className="text-[#00d2ff]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-xs text-white truncate">
                        {duty.dutyTitle}
                      </p>
                      {getPriorityBadge(duty.priority)}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <User size={12} className="text-sky-400" />
                        {staffName}
                      </span>

                      {duty.zoneName && (
                        <span className="flex items-center gap-1 text-slate-300">
                          <Radio size={12} className="text-cyan-400" />
                          {duty.zoneName}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {duty.startTime} - {duty.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pl-13 sm:pl-0">
                  {getStatusBadge(duty.status)}

                  <Link
                    href={`/manager/duties?id=${duty._id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-slate-400 transition hover:bg-slate-700 hover:text-white"
                  >
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-3 border-t border-slate-800/80 pt-3 text-center">
        <Link
          href="/manager/duties"
          className="text-xs font-semibold text-sky-400 hover:text-sky-300 transition inline-flex items-center gap-1"
        >
          View all field jobs & work orders →
        </Link>
      </div>
    </div>
  );
}
