"use client";

import Link from "next/link";
import {
  Radio,
  Plus,
  Users,
  ClipboardList,
  Clock,
  Activity,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import ManagerStats from "@/components/manager/dashboard/ManagerStats";
import ActiveDutiesFeed from "@/components/manager/dashboard/ActiveDutiesFeed";
import ZoneCoverageCard from "@/components/manager/dashboard/ZoneCoverageCard";
import { useAuth } from "@/hooks/useAuth";

export default function ManagerDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Top Banner / Command Center Header */}
      <section className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-r from-[#0f172a] via-[#141e33] to-[#0f172a] p-5 sm:p-6 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 -mb-16 h-48 w-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
             
            </div>

          
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              href="/manager/duties"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition hover:from-sky-500 hover:to-cyan-500 active:scale-95"
            >
              <Plus size={16} />
              New Work Order
            </Link>

            <Link
              href="/manager/zones"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <Radio size={16} className="text-[#00d2ff]" />
              Manage Zones
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time KPI Stats Bar */}
      <ManagerStats />

      {/* Network Zones & Sectors Overview */}
      <ZoneCoverageCard />

      {/* Active Field Duties & Live Work Orders */}
      <ActiveDutiesFeed />
    </div>
  );
}