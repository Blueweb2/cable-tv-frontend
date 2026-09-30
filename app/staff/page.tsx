"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Radio } from "lucide-react";
import StaffHeader from "@/components/staff/StaffHeader";
import StaffStats from "@/components/staff/StaffStats";
import TodayDuties from "@/components/staff/TodayDuties";
import HeroActiveShiftWidget from "@/components/staff/shift/HeroActiveShiftWidget";
import InteractiveDutyChecklist from "@/components/staff/shift/InteractiveDutyChecklist";
import ShiftNotificationsFeed from "@/components/staff/shift/ShiftNotificationsFeed";
import { useAuth } from "@/hooks/useAuth";
import { getAssignments } from "@/lib/assignment.api";
import { getAttendance } from "@/lib/attendance.api";
import type { Assignment } from "@/types/assignment";
import type { Attendance } from "@/types/attendance";

export default function StaffHomePage() {
  const { user, token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(
    async (silent = false) => {
      if (!token) return;
      try {
        if (!silent) setLoading(true);
        setError("");
        const [assignmentResult, attendanceResult] = await Promise.all([
          getAssignments(token, { page: 1, limit: 100 }),
          getAttendance(token, { page: 1, limit: 100 }),
        ]);
        setAssignments(assignmentResult.data || []);
        setAttendance(attendanceResult.data || []);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Unable to load your dashboard.");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    void loadDashboard(false);

    const interval = setInterval(() => {
      void loadDashboard(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [loadDashboard]);

  return (
    <main className="space-y-4 sm:space-y-6 lg:space-y-8 py-3.5 sm:py-6 text-slate-100">
      <StaffHeader />

      <section>
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-xs font-semibold text-cyan-400 backdrop-blur-md mb-2">
          <Radio size={14} className="animate-pulse text-cyan-400" />
          <span>Field Staff Console</span>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white">
          Welcome back, {user?.name || "Technician"} ⚡
        </h1>
        <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-400">
          Monitor your active work orders, site locations, SOP checklist, and upload photo evidence.
        </p>
      </section>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs sm:text-sm text-red-300">
          <AlertCircle size={17} className="text-red-400 shrink-0" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={() => void loadDashboard()} className="text-xs font-bold underline text-cyan-400">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-[#0f172a]">
          <Loader2 size={28} className="animate-spin text-cyan-400" />
          <p className="mt-3 text-xs sm:text-sm text-slate-400">Loading your field operations dashboard...</p>
        </div>
      ) : (
        <>
          {/* 1. Hero Active Shift Widget */}
          <div id="active-shift">
            <HeroActiveShiftWidget
              assignments={assignments}
              attendance={attendance}
              onAttendanceUpdate={loadDashboard}
            />
          </div>

          {/* Quick Stats Bar */}
          <StaffStats assignments={assignments} attendance={attendance} />

          {/* 2 & 3: Interactive Duty Checklist & Shift Notifications Feed */}
          <div className="grid gap-6 xl:grid-cols-2">
            <div id="duty-checklist" className="w-full min-w-0 overflow-x-auto">
              <InteractiveDutyChecklist assignments={assignments} onUpdate={loadDashboard} />
            </div>
            <ShiftNotificationsFeed assignments={assignments} />
          </div>

          {/* Today Duties / Work Orders */}
          <div id="today-duties">
            <TodayDuties assignments={assignments} />
          </div>
        </>
      )}
    </main>
  );
}
