"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  MapPin,
  Play,
  Pause,
  Square,
  AlertCircle,
  CheckCircle2,
  Navigation,
  Camera,
  Radio,
  Wrench,
  Zap,
} from "lucide-react";
import type { Assignment } from "@/types/assignment";
import type { Attendance } from "@/types/attendance";
import { checkInStaff, checkOutStaff, pauseStaffShift, resumeStaffShift } from "@/lib/attendance.api";
import { useAuth } from "@/hooks/useAuth";
import { formatTime24to12 } from "@/lib/duty-mapper";
import PauseShiftModal from "./PauseShiftModal";
import SitePhotosUploadModal from "../SitePhotosUploadModal";
import SitePhotosGallery from "../SitePhotosGallery";
import SiteLocationCard from "../SiteLocationCard";

interface HeroActiveShiftWidgetProps {
  assignments: Assignment[];
  attendance: Attendance[];
  onAttendanceUpdate?: () => void;
}

export default function HeroActiveShiftWidget({
  assignments,
  attendance,
  onAttendanceUpdate,
}: HeroActiveShiftWidgetProps) {
  const { token, user } = useAuth();

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayShift = assignments.find(
    (item) => item.dutyDate.slice(0, 10) === todayStr && item.status !== "CANCELLED"
  ) || assignments[0];

  const todayAttendance = attendance.find((att) => {
    const dutyId = typeof att.duty === "string" ? att.duty : att.duty?._id;
    return dutyId === todayShift?._id;
  }) || attendance[0];

  const checkInTime = todayAttendance?.checkIn ? new Date(todayAttendance.checkIn) : null;
  const checkOutTime = todayAttendance?.checkOut ? new Date(todayAttendance.checkOut) : null;
  const isPaused = Boolean(todayAttendance?.isPaused);
  const pausedAtTime = todayAttendance?.pausedAt ? new Date(todayAttendance.pausedAt) : null;
  const totalPauseMins = todayAttendance?.totalPauseMinutes || 0;

  const isCheckedIn = Boolean(checkInTime && !checkOutTime);
  const isCompleted = Boolean(checkInTime && checkOutTime);

  // Live Timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkInTime || checkOutTime) {
      if (checkInTime && checkOutTime) {
        const totalDuration = Math.max(
          0,
          Math.floor((checkOutTime.getTime() - checkInTime.getTime()) / 1000) - totalPauseMins * 60
        );
        setElapsedSeconds(totalDuration);
      } else {
        setElapsedSeconds(0);
      }
      return;
    }

    const calculateElapsed = () => {
      const now = new Date();
      let total = Math.floor((now.getTime() - checkInTime.getTime()) / 1000);
      let pauseSec = totalPauseMins * 60;
      if (isPaused && pausedAtTime) {
        pauseSec += Math.floor((now.getTime() - pausedAtTime.getTime()) / 1000);
      }
      setElapsedSeconds(Math.max(0, total - pauseSec));
    };

    calculateElapsed();
    const timer = setInterval(calculateElapsed, 1000);
    return () => clearInterval(timer);
  }, [checkInTime, checkOutTime, isPaused, pausedAtTime, totalPauseMins]);

  const formatElapsedTime = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const handlePunchIn = async () => {
    if (!token) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await checkInStaff(token, {
        duty: todayShift?._id,
        zone: typeof todayShift?.zone === "string" ? todayShift.zone : todayShift?.zone?._id,
        location: todayShift?.location || "Field Shift",
        notes: "Technician punched in from mobile app",
      });
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch (err: any) {
      setActionError(err.message || "Punch in failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePause = async (reason: string, notes?: string) => {
    if (!token) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await pauseStaffShift(token, {
        duty: todayShift?._id,
        reason,
        notes,
      });
      setIsPauseModalOpen(false);
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch (err: any) {
      setActionError(err.message || "Failed to pause shift");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResume = async () => {
    if (!token) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await resumeStaffShift(token, {
        duty: todayShift?._id,
        notes: "Shift resumed",
      });
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch (err: any) {
      setActionError(err.message || "Failed to resume shift");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePunchOut = async () => {
    if (!token) return;
    if (!confirm("Are you sure you want to end and punch out of your active shift?")) return;
    try {
      setActionLoading(true);
      setActionError(null);
      await checkOutStaff(token, {
        duty: todayShift?._id,
        location: todayShift?.location || "Field Shift",
        notes: "Technician punched out",
      });
      if (onAttendanceUpdate) onAttendanceUpdate();
    } catch (err: any) {
      setActionError(err.message || "Punch out failed");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-[#0f172a] p-5 sm:p-7 shadow-2xl text-slate-100">
      {/* Glow Effects */}
      <div className="absolute right-0 top-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute left-1/3 bottom-0 -mb-20 h-64 w-64 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Top Status Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/25">
              <Radio size={24} className={isCheckedIn && !isPaused ? "animate-pulse" : ""} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isCheckedIn && !isPaused
                      ? "bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400"
                      : isPaused
                      ? "bg-amber-400"
                      : isCompleted
                      ? "bg-sky-400"
                      : "bg-slate-500"
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
                  {isCheckedIn && !isPaused
                    ? "In-Field Active Shift"
                    : isPaused
                    ? "Shift Paused (Break / Transit)"
                    : isCompleted
                    ? "Shift Finished"
                    : "Standby / Ready to Punch In"}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-black text-white mt-0.5">
                {todayShift?.dutyTitle || "General Field Shift"}
              </h2>
            </div>
          </div>

          {/* Shift Time & Location Tags */}
          <div className="flex flex-wrap items-center gap-2 sm:justify-end text-xs">
            {todayShift?.zoneName && (
              <span className="rounded-lg bg-sky-500/10 px-2.5 py-1 text-sky-400 border border-sky-500/20 font-semibold">
                🌐 {todayShift.zoneName}
              </span>
            )}
            {todayShift?.nodeNumber && (
              <span className="rounded-lg bg-cyan-500/10 px-2.5 py-1 text-cyan-300 border border-cyan-500/20 font-mono font-bold">
                ⚡ {todayShift.nodeNumber}
              </span>
            )}
          </div>
        </div>

        {actionError && (
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Live Timer Counter & Punch Controls */}
        <div className="grid sm:grid-cols-[1.4fr_1fr] gap-4 items-center rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock size={13} className="text-[#00d2ff]" />
              Active Shift Duration
            </span>

            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-3xl sm:text-4xl font-black text-white tracking-tight">
                {formatElapsedTime(elapsedSeconds)}
              </span>
              {isPaused && (
                <span className="text-xs font-bold text-amber-400 uppercase">
                  (On Break)
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] text-slate-400">
              {checkInTime
                ? `Punched in at ${checkInTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Punch in when you reach your field station or first job site."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 justify-start sm:justify-end">
            {!isCheckedIn && !isCompleted && (
              <button
                type="button"
                onClick={handlePunchIn}
                disabled={actionLoading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-400 active:scale-95 disabled:opacity-50"
              >
                <Play size={16} />
                <span>Punch In / Start Shift</span>
              </button>
            )}

            {isCheckedIn && (
              <>
                {isPaused ? (
                  <button
                    type="button"
                    onClick={handleResume}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
                  >
                    <Play size={14} /> Resume Shift
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsPauseModalOpen(true)}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20"
                  >
                    <Pause size={14} /> Break / Transit
                  </button>
                )}

                {todayShift && (
                  <button
                    type="button"
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-sky-500 hover:to-cyan-500"
                  >
                    <Camera size={14} /> Add Site Photo
                  </button>
                )}

                <button
                  type="button"
                  onClick={handlePunchOut}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-500/20"
                >
                  <Square size={14} /> Punch Out
                </button>
              </>
            )}

            {isCompleted && (
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <CheckCircle2 size={16} />
                <span>Shift successfully logged for today!</span>
              </div>
            )}
          </div>
        </div>

        {/* Site Location & Diagnostics Details Card */}
        {todayShift && <SiteLocationCard duty={todayShift} />}

        {/* Site Photo Gallery */}
        {todayShift?.sitePhotos && todayShift.sitePhotos.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <SitePhotosGallery photos={todayShift.sitePhotos} />
          </div>
        )}
      </div>

      {/* Pause Modal */}
      {isPauseModalOpen && (
        <PauseShiftModal
          isOpen={isPauseModalOpen}
          onClose={() => setIsPauseModalOpen(false)}
          onConfirmPause={handlePause}
        />
      )}

      {/* Site Photo Upload Modal */}
      {isPhotoModalOpen && todayShift && token && (
        <SitePhotosUploadModal
          isOpen={isPhotoModalOpen}
          onClose={() => setIsPhotoModalOpen(false)}
          duty={todayShift}
          token={token}
          onPhotoUploaded={(updated) => {
            setIsPhotoModalOpen(false);
            if (onAttendanceUpdate) onAttendanceUpdate();
          }}
        />
      )}
    </div>
  );
}
