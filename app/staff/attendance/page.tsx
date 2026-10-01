"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clock,
  Clock3,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  TrendingUp,
  Award,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getAssignments } from "@/lib/assignment.api";
import { checkIn, checkOut, getAttendance } from "@/lib/attendance.api";
import type { Assignment } from "@/types/assignment";
import type { Attendance } from "@/types/attendance";

const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(
    new Date(value)
  );

const timeLabel = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-IN", { timeStyle: "short" }).format(
        new Date(value)
      )
    : "--";

const isToday = (value: string) => {
  const today = new Date();
  const date = new Date(value);
  return today.toDateString() === date.toDateString();
};

export default function StaffAttendancePage() {
  const { token } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [shiftNotes, setShiftNotes] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  const loadAttendance = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const [assignmentResult, attendanceResult] = await Promise.all([
        getAssignments(token, { page: 1, limit: 100 }),
        getAttendance(token, { page: 1, limit: 100 }),
      ]);
      setAssignments(assignmentResult.data || []);
      setAttendance(attendanceResult.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadAttendance(), 0);
    return () => window.clearTimeout(timer);
  }, [loadAttendance]);

  const attendanceByDuty = useMemo(
    () =>
      new Map(
        attendance.map((item) => [
          typeof item.duty === "string" ? item.duty : item.duty?._id || item._id,
          item,
        ])
      ),
    [attendance]
  );

  const activeAttendance = attendance.find(
    (item) => item.checkIn && !item.checkOut && isToday(item.date)
  );

  const totalAttendance = attendance.length;
  const presentCount = attendance.filter(
    (item) => item.status === "PRESENT" || item.status === "LATE"
  ).length;
  const completedCount = attendance.filter((item) => item.checkOut).length;

  const attendanceRate =
    totalAttendance > 0
      ? Math.round((presentCount / totalAttendance) * 100)
      : 100;

  // Total Hours Logged Calculation
  const totalLoggedHours = useMemo(() => {
    let minutes = 0;
    attendance.forEach((att) => {
      if (att.checkIn && att.checkOut) {
        const start = new Date(att.checkIn).getTime();
        const end = new Date(att.checkOut).getTime();
        const diff = Math.max(0, end - start);
        minutes += diff / (1000 * 60);
      }
    });
    return (minutes / 60).toFixed(1);
  }, [attendance]);

  const handleAttendance = async (
    assignment: Assignment,
    record?: Attendance
  ) => {
    if (!token || actionId) return;

    try {
      setActionId(assignment._id);
      setError("");

      const noteText = shiftNotes[assignment._id] || "";
      const updated =
        record?.checkIn && !record.checkOut
          ? await checkOut({ duty: assignment._id, notes: noteText }, token)
          : await checkIn({ duty: assignment._id, notes: noteText }, token);

      setAttendance((current) => {
        const exists = current.some((item) => item._id === updated._id);
        return exists
          ? current.map((item) => (item._id === updated._id ? updated : item))
          : [updated, ...current];
      });

      setShiftNotes((prev) => ({ ...prev, [assignment._id]: "" }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Attendance action failed."
      );
    } finally {
      setActionId(null);
    }
  };

  return (
    <main className="space-y-6 py-5 sm:space-y-8 sm:py-6">
      {/* Header */}
      <header className="border-b border-[#e8e1d8] pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#9a6c37]">
          Staff Portal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#29241f] sm:text-3xl">
          Check In & Shift Attendance
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#756d64]">
          Record attendance, check in to assigned event duties, and view shift history.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700"
        >
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={() => void loadAttendance()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-[#e8e1d8] bg-white">
          <Loader2 size={28} className="animate-spin text-[#9a6c37]" />
        </div>
      ) : (
        <>
          {/* Performance Summary KPI Cards */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Summary
              label="Attendance Rate"
              value={`${attendanceRate}%`}
              subtext="Overall punctuality"
              icon={<TrendingUp size={16} className="text-emerald-600" />}
            />
            <Summary
              label="Completed Shifts"
              value={completedCount}
              subtext="Total duties completed"
              icon={<Award size={16} className="text-amber-600" />}
            />
            <Summary
              label="Logged Hours"
              value={`${totalLoggedHours} hrs`}
              subtext="Total shift time"
              icon={<Clock size={16} className="text-blue-600" />}
            />
            <Summary
              label="Active Check-In"
              value={activeAttendance ? "1 Shift" : "None"}
              subtext="Currently live"
              icon={<Clock3 size={16} className="text-purple-600" />}
            />
          </section>

          {/* Active Live Shift Banner */}
          {activeAttendance && (
            <section className="overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-br from-[#0f172a] to-[#090d16] text-white shadow-xl">
              <div className="flex flex-col items-center px-6 py-8 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-cyan-400 bg-cyan-950/40 text-cyan-400 shadow-inner">
                  <Check size={40} strokeWidth={3} />
                </div>
                <p className="mt-4 text-xs font-bold uppercase tracking-widest text-cyan-400">
                  Field Shift Live & Active
                </p>
                <p className="mt-1 text-2xl font-black tracking-wide text-white">
                  In at {timeLabel(activeAttendance.checkIn)}
                </p>
                <p className="mt-1.5 text-xs text-slate-300">
                  {typeof activeAttendance.duty === "object" && activeAttendance.duty !== null
                    ? activeAttendance.duty.dutyTitle
                    : "Assigned Work Order"}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    const assignment = assignments.find(
                      (item) =>
                        item._id ===
                        (typeof activeAttendance.duty === "string"
                          ? activeAttendance.duty
                          : activeAttendance.duty?._id)
                    );
                    if (assignment)
                      void handleAttendance(assignment, activeAttendance);
                  }}
                  disabled={Boolean(actionId)}
                  className="mt-6 inline-flex min-h-12 w-full max-w-sm items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 px-5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50 cursor-pointer"
                >
                  <LogOut size={16} />
                  {actionId ? "Saving..." : "Clock Out Shift"}
                </button>
              </div>
            </section>
          )}

          {/* Assigned Duties List */}
          <section className="rounded-2xl border border-slate-800 bg-[#0f172a] p-5 shadow-sm sm:p-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-base font-bold text-white">
                  Assigned Work Orders & Shifts
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Tap Check In when you arrive at your assigned field network site.
                </p>
              </div>
              <CalendarDays size={19} className="text-cyan-400" />
            </div>

            <div className="mt-4 space-y-4">
              {assignments.length === 0 ? (
                <p className="rounded-xl bg-slate-900 p-4 text-xs text-slate-400">
                  No work orders assigned yet. Check back soon for dispatched jobs.
                </p>
              ) : (
                assignments.map((assignment) => {
                  const record = attendanceByDuty.get(assignment._id);
                  const isCheckedIn = Boolean(
                    record?.checkIn && !record.checkOut
                  );
                  const isComplete = Boolean(record?.checkOut || assignment.status === "COMPLETED");

                  return (
                    <article
                      key={assignment._id}
                      className={`rounded-2xl border p-4.5 transition ${
                        isCheckedIn
                          ? "border-cyan-500/40 bg-cyan-950/20"
                          : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-white">
                              {assignment.dutyTitle}
                            </h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                isComplete
                                  ? "bg-slate-800 text-slate-400 border border-slate-700"
                                  : isCheckedIn
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {isComplete
                                ? "Completed"
                                : isCheckedIn
                                ? "Shift Live"
                                : assignment.status}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {typeof assignment.zone === "object" && assignment.zone !== null
                              ? `${assignment.zone.zoneName} · Node ${assignment.nodeNumber || "1"}`
                              : assignment.siteLocation?.address || "Network Field Site"}
                          </p>

                          <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                              <CalendarDays
                                size={14}
                                className="text-cyan-400"
                              />
                              {dateLabel(assignment.dutyDate)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Clock3 size={14} className="text-cyan-400" />
                              {assignment.startTime} - {assignment.endTime}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin size={14} className="text-cyan-400" />
                              {assignment.siteLocation?.address || "Site location in work order"}
                            </span>
                          </div>
                        </div>

                        {/* Shift Notes & Check In Button */}
                        <div className="flex flex-col gap-2 sm:items-end">
                          {!isComplete && (
                            <input
                              type="text"
                              placeholder="Add shift note (optional)..."
                              value={shiftNotes[assignment._id] || ""}
                              onChange={(e) =>
                                setShiftNotes((prev) => ({
                                  ...prev,
                                  [assignment._id]: e.target.value,
                                }))
                              }
                              className="h-8 w-full sm:w-48 rounded-lg border border-[#e3dbd2] bg-white px-2.5 text-[11px] outline-none focus:border-[#9a6c37]"
                            />
                          )}

                          <button
                            type="button"
                            disabled={
                              Boolean(actionId) ||
                              isComplete ||
                              Boolean(activeAttendance && !isCheckedIn)
                            }
                            onClick={() =>
                              void handleAttendance(assignment, record)
                            }
                            className={`min-h-10 w-full sm:w-auto rounded-xl px-5 text-xs font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
                              isCheckedIn
                                ? "bg-[#557555] hover:bg-[#456345]"
                                : "bg-[#9a6c37] hover:bg-[#7e582d]"
                            }`}
                          >
                            {actionId === assignment._id ? (
                              "Saving..."
                            ) : isCheckedIn ? (
                              <>
                                <LogOut size={14} className="mr-1.5 inline" />
                                Check Out
                              </>
                            ) : (
                              <>
                                <LogIn size={14} className="mr-1.5 inline" />
                                Check In Shift
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {record?.checkIn && (
                        <div className="mt-3 border-t border-black/5 pt-2.5 text-[11px] text-gray-500 flex flex-wrap justify-between">
                          <span>
                            Logged: In {timeLabel(record.checkIn)}
                            {record.checkOut
                              ? ` · Out ${timeLabel(record.checkOut)}`
                              : ""}
                          </span>
                          {record.notes && (
                            <span className="font-medium text-amber-800">
                              Note: {record.notes}
                            </span>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </section>

          {/* Attendance History */}
          <section className="rounded-2xl border border-[#e8e1d8] bg-white shadow-sm">
            <div className="border-b border-[#eee8e1] px-5 py-4">
              <h2 className="text-base font-bold text-[#29241f]">
                Attendance History Logs
              </h2>
              <p className="mt-0.5 text-xs text-[#8d847b]">
                Recent recorded duty attendance entries
              </p>
            </div>
            <div className="divide-y divide-[#eee8e1]">
              {attendance.length === 0 ? (
                <p className="p-5 text-xs text-gray-500">
                  No attendance records logged yet.
                </p>
              ) : (
                attendance.slice(0, 10).map((record) => (
                  <div
                    key={record._id}
                    className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between hover:bg-[#faf8f5] transition"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#29241f]">
                        {typeof record.duty === "string"
                          ? "Duty attendance"
                          : record.duty?.dutyTitle || "Duty attendance"}
                      </p>
                      <p className="mt-0.5 text-[11px] text-[#756d64]">
                        {dateLabel(record.date)} · In {timeLabel(record.checkIn)} · Out {timeLabel(record.checkOut)}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-[#edf5ed] px-3 py-0.5 text-[10px] font-bold text-[#557555] border border-emerald-200">
                      {record.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Summary({
  label,
  value,
  subtext,
  icon,
}: {
  label: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e1d8] bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#8d847b]">
          {label}
        </p>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-[#29241f]">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] text-gray-400">{subtext}</p>
    </div>
  );
}
