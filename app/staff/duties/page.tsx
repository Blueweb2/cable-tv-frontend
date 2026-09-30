"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  Play,
  Pause,
  Lock,
  Loader2,
  CheckSquare,
  Square,
  AlertCircle,
  Camera,
  ShieldCheck,
  Zap,
  Activity,
  Navigation,
  Sparkles,
  ListChecks,
  Plus,
  Radio,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useAssignments } from "@/hooks/useAssignments";
import { useAttendance } from "@/hooks/useAttendance";
import {
  acceptAssignment,
  rejectAssignment,
  updateAssignmentChecklist,
  startTask,
  completeTask,
} from "@/lib/assignment.api";
import { pauseStaffShift, resumeStaffShift } from "@/lib/attendance.api";
import type { Assignment, SitePhoto } from "@/types/assignment";
import { formatTime24to12 } from "@/lib/duty-mapper";
import { ListSkeleton } from "@/components/common/SkeletonLoaders";
import RichEmptyState from "@/components/common/RichEmptyState";
import ErrorMessage from "@/components/common/ErrorMessage";
import DeclineShiftModal from "@/components/staff/shift/DeclineShiftModal";
import PauseShiftModal from "@/components/staff/shift/PauseShiftModal";
import CompleteTaskModal from "@/components/staff/shift/CompleteTaskModal";
import SiteLocationCard from "@/components/staff/SiteLocationCard";
import SitePhotosGallery from "@/components/staff/SitePhotosGallery";
import SitePhotosUploadModal from "@/components/staff/SitePhotosUploadModal";

const getLocation = (): Promise<string> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve("Location tracking not supported by browser");
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(
            `Location: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
          );
        },
        () => {
          resolve("Location permission denied or unavailable");
        },
        { timeout: 5000 }
      );
    }
  });
};

const JOB_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  FIBER_SPLICING: { bg: "bg-cyan-950/40", text: "text-cyan-400", border: "border-cyan-500/30" },
  LINE_MAINTENANCE: { bg: "bg-amber-950/40", text: "text-amber-400", border: "border-amber-500/30" },
  NODE_REPAIR: { bg: "bg-rose-950/40", text: "text-rose-400", border: "border-rose-500/30" },
  NEW_CONNECTION: { bg: "bg-emerald-950/40", text: "text-emerald-400", border: "border-emerald-500/30" },
  PAYMENT_COLLECTION: { bg: "bg-blue-950/40", text: "text-blue-400", border: "border-blue-500/30" },
  EMERGENCY_RESTORE: { bg: "bg-red-950/60", text: "text-red-400", border: "border-red-500/50" },
};

export default function StaffDutiesPage() {
  const { token, user } = useAuth();

  const {
    assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
    fetchAssignments,
  } = useAssignments({
    token,
    filters: { staff: user?.id },
    autoFetch: true,
  });

  const {
    attendance,
    staffCheckIn,
    staffCheckOut,
    fetchAttendance,
  } = useAttendance({
    token,
    filters: { staff: user?.id },
    autoFetch: true,
  });

  // Local state for optimistic checklist, acceptance, and decline updates
  const [localDuties, setLocalDuties] = useState<Assignment[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "ACTIVE" | "COMPLETED">("ALL");

  // Modals state
  const [decliningDuty, setDecliningDuty] = useState<Assignment | null>(null);
  const [pausingDutyId, setPausingDutyId] = useState<string | null>(null);
  const [completingDuty, setCompletingDuty] = useState<Assignment | null>(null);
  const [photoUploadDuty, setPhotoUploadDuty] = useState<Assignment | null>(null);

  // Sync loaded assignments into local state
  useEffect(() => {
    if (assignments) {
      setLocalDuties(assignments);
    }
  }, [assignments]);

  // Combined attendance duty record map for fast lookup
  const attendanceDutyMap = useMemo(() => {
    const map = new Map<string, any>();
    if (!attendance) return map;

    attendance.forEach((rec) => {
      if (Array.isArray(rec.duties)) {
        rec.duties.forEach((d: any) => {
          const dutyId = typeof d.duty === "string" ? d.duty : d.duty?._id;
          if (dutyId) {
            map.set(dutyId, { ...d, attendanceId: rec._id });
          }
        });
      }
    });

    return map;
  }, [attendance]);

  // Filtered duties
  const filteredDuties = useMemo(() => {
    return localDuties.filter((duty) => {
      if (statusFilter === "PENDING") return duty.status === "PENDING_ACCEPTANCE" || duty.status === "ASSIGNED";
      if (statusFilter === "ACTIVE") return duty.status === "ACCEPTED" || duty.status === "IN_PROGRESS";
      if (statusFilter === "COMPLETED") return duty.status === "COMPLETED";
      return true;
    });
  }, [localDuties, statusFilter]);

  // Handle Accept Work Order
  const handleAccept = async (dutyId: string) => {
    if (!token) return;
    setProcessingId(dutyId);
    try {
      await acceptAssignment(dutyId, token);
      setLocalDuties((prev) =>
        prev.map((d) => (d._id === dutyId ? { ...d, status: "ACCEPTED" } : d))
      );
      await fetchAssignments();
    } catch (err) {
      console.error("Failed to accept duty:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Decline Work Order
  const handleConfirmDecline = async (dutyId: string, reason: string) => {
    if (!token) return;
    setProcessingId(dutyId);
    try {
      await rejectAssignment(dutyId, reason, token);
      setLocalDuties((prev) =>
        prev.map((d) => (d._id === dutyId ? { ...d, status: "REJECTED", rejectionReason: reason } : d))
      );
      setDecliningDuty(null);
      await fetchAssignments();
    } catch (err) {
      console.error("Failed to decline duty:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Shift Check-in / Start Task
  const handleCheckIn = async (dutyId: string) => {
    if (!token) return;
    setProcessingId(dutyId);
    try {
      const location = await getLocation();
      await startTask(dutyId, token);
      await staffCheckIn({ dutyId, locationCheckIn: location });
      setLocalDuties((prev) =>
        prev.map((d) => (d._id === dutyId ? { ...d, status: "IN_PROGRESS" } : d))
      );
      await Promise.all([fetchAssignments(), fetchAttendance()]);
    } catch (err) {
      console.error("Failed to check in to duty:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Pause Shift
  const handleConfirmPause = async (dutyId: string, reason: string) => {
    if (!token) return;
    setProcessingId(dutyId);
    try {
      const attRecord = attendanceDutyMap.get(dutyId);
      if (attRecord?.attendanceId) {
        await pauseStaffShift(attRecord.attendanceId, { dutyId, reason }, token);
      }
      setPausingDutyId(null);
      await fetchAttendance();
    } catch (err) {
      console.error("Failed to pause shift:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Resume Shift
  const handleResumeShift = async (dutyId: string) => {
    if (!token) return;
    setProcessingId(dutyId);
    try {
      const attRecord = attendanceDutyMap.get(dutyId);
      if (attRecord?.attendanceId) {
        await resumeStaffShift(attRecord.attendanceId, { dutyId }, token);
      }
      await fetchAttendance();
    } catch (err) {
      console.error("Failed to resume shift:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Complete Task
  const handleConfirmComplete = async (dutyId: string, finalOpticPower?: number, notes?: string) => {
    if (!token) return;
    setProcessingId(dutyId);
    try {
      const location = await getLocation();
      await completeTask(dutyId, { finalOpticalPowerDbm: finalOpticPower, resolutionNotes: notes }, token);
      await staffCheckOut({ dutyId, locationCheckOut: location });
      setLocalDuties((prev) =>
        prev.map((d) =>
          d._id === dutyId
            ? { ...d, status: "COMPLETED", finalOpticalPowerDbm: finalOpticPower, completionNotes: notes }
            : d
        )
      );
      setCompletingDuty(null);
      await Promise.all([fetchAssignments(), fetchAttendance()]);
    } catch (err) {
      console.error("Failed to complete duty:", err);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Toggle Sub-Task Checklist
  const handleToggleSubTask = async (dutyId: string, index: number) => {
    if (!token) return;
    const targetDuty = localDuties.find((d) => d._id === dutyId);
    if (!targetDuty || !targetDuty.checklist) return;

    const updatedChecklist = targetDuty.checklist.map((item, idx) =>
      idx === index ? { ...item, completed: !item.completed } : item
    );

    // Optimistic UI update
    setLocalDuties((prev) =>
      prev.map((d) => (d._id === dutyId ? { ...d, checklist: updatedChecklist } : d))
    );

    try {
      await updateAssignmentChecklist(dutyId, updatedChecklist, token);
    } catch (err) {
      console.error("Failed to update checklist:", err);
      // Rollback on error
      setLocalDuties((prev) =>
        prev.map((d) => (d._id === dutyId ? { ...d, checklist: targetDuty.checklist } : d))
      );
    }
  };

  const activeDutiesCount = useMemo(
    () => localDuties.filter((d) => d.status === "IN_PROGRESS" || d.status === "ACCEPTED").length,
    [localDuties]
  );

  const pendingCount = useMemo(
    () => localDuties.filter((d) => d.status === "PENDING_ACCEPTANCE" || d.status === "ASSIGNED").length,
    [localDuties]
  );

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header & Overview */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-950/30 px-3 py-1 text-xs font-semibold text-cyan-400 backdrop-blur-md mb-2">
            <Radio size={14} className="animate-pulse text-cyan-400" />
            <span>Field Technician Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Work Orders & Field Operations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            View assigned fiber repairs, customer installations, node locations & upload site photo evidence.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 p-1.5">
          {(
            [
              { id: "ALL", label: "All Orders", count: localDuties.length },
              { id: "PENDING", label: "Pending", count: pendingCount },
              { id: "ACTIVE", label: "Active", count: activeDutiesCount },
              { id: "COMPLETED", label: "Completed", count: localDuties.filter((d) => d.status === "COMPLETED").length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`rounded-full px-1.5 py-0.2 text-[10px] font-black ${
                statusFilter === tab.id ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading & Error States */}
      {assignmentsLoading && (
        <div className="space-y-4">
          <ListSkeleton count={3} />
        </div>
      )}

      {assignmentsError && (
        <ErrorMessage
          message={assignmentsError}
          onRetry={() => {
            fetchAssignments();
            fetchAttendance();
          }}
        />
      )}

      {/* Empty State */}
      {!assignmentsLoading && !assignmentsError && filteredDuties.length === 0 && (
        <RichEmptyState
          title="No Work Orders Found"
          description={
            statusFilter === "ALL"
              ? "You do not have any field assignments assigned yet. The NOC or Operations Lead will dispatch work orders here."
              : `No work orders currently match the "${statusFilter}" filter.`
          }
          icon={Activity}
        />
      )}

      {/* Duties List */}
      {!assignmentsLoading && !assignmentsError && filteredDuties.length > 0 && (
        <div className="space-y-6">
          {filteredDuties.map((assignment) => {
            const dutyRecord = attendanceDutyMap.get(assignment._id);
            const isCheckedIn = Boolean(dutyRecord?.checkIn && !dutyRecord?.checkOut);
            const isCompleted = assignment.status === "COMPLETED";
            const isRejected = assignment.status === "REJECTED";
            const isPendingAcceptance =
              assignment.status === "PENDING_ACCEPTANCE" || assignment.status === "ASSIGNED";
            const isPaused = Boolean(dutyRecord?.isPaused);

            const checklist = assignment.checklist || [];
            const completedChecklistCount = checklist.filter((i) => i.completed).length;
            const checklistProgress =
              checklist.length > 0
                ? Math.round((completedChecklistCount / checklist.length) * 100)
                : 0;

            const jobTypeStyle =
              JOB_TYPE_COLORS[assignment.jobType || ""] || {
                bg: "bg-slate-800",
                text: "text-slate-300",
                border: "border-slate-700",
              };

            return (
              <div
                key={assignment._id}
                className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-800 bg-[#0f172a]/95 p-5 sm:p-6 shadow-xl backdrop-blur-md transition hover:border-slate-700"
              >
                {/* Status Indicator Bar */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 ${
                    isCompleted
                      ? "bg-emerald-500"
                      : isCheckedIn
                      ? "bg-cyan-400 animate-pulse"
                      : isPendingAcceptance
                      ? "bg-amber-400"
                      : "bg-slate-700"
                  }`}
                />

                {/* Top Row: Job Title, Type & Actions */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide uppercase ${jobTypeStyle.bg} ${jobTypeStyle.text} ${jobTypeStyle.border}`}
                      >
                        <Zap size={12} />
                        {assignment.jobType ? assignment.jobType.replace(/_/g, " ") : assignment.role || "FIELD WORK ORDER"}
                      </span>

                      {assignment.priority && (
                        <span
                          className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            assignment.priority === "CRITICAL"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                              : assignment.priority === "HIGH"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {assignment.priority} Priority
                        </span>
                      )}

                      {typeof assignment.zone === "object" && assignment.zone !== null && (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900 border border-slate-700 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                          📍 {assignment.zone.zoneName} (Node {assignment.nodeNumber || assignment.zone.zoneCode})
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                      {assignment.dutyTitle}
                    </h2>
                  </div>

                  {/* Top Right Status Badge & Photo Trigger */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPhotoUploadDuty(assignment)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/30 hover:bg-cyan-900/50 px-3 py-1.5 text-xs font-bold text-cyan-300 transition active:scale-95 cursor-pointer shadow-xs"
                    >
                      <Camera size={14} />
                      <span>Upload Photos ({assignment.sitePhotos?.length || 0})</span>
                    </button>

                    <span
                      className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-black uppercase tracking-wider ${
                        isCompleted
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : isCheckedIn
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse"
                          : isPendingAcceptance
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isCompleted
                        ? "Completed"
                        : isCheckedIn
                        ? "In Progress"
                        : isPendingAcceptance
                        ? "Pending Acceptance"
                        : assignment.status}
                    </span>
                  </div>
                </div>

                {/* Duty Timing & Wage Grid */}
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                    <CalendarDays size={16} className="text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scheduled Date</p>
                      <p className="text-xs font-bold text-white truncate">
                        {assignment.dutyDate
                          ? new Date(assignment.dutyDate).toLocaleDateString("en-IN", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Scheduled ASAP"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                    <Clock3 size={16} className="text-cyan-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shift Window</p>
                      <p className="text-xs font-bold text-white truncate">
                        {formatTime24to12(assignment.startTime)} – {formatTime24to12(assignment.endTime)} ({assignment.totalHours || 0} hrs)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-900/60 border border-slate-800 p-3">
                    <span className="text-emerald-400 font-bold text-sm shrink-0">₹</span>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Field Allowance</p>
                      <p className="text-xs font-bold text-emerald-400 truncate">
                        {assignment.hourlyRate ? `₹${assignment.hourlyRate}/hr` : "Standard Ops Pay"}
                        {assignment.totalAmount ? ` · ₹${assignment.totalAmount.toLocaleString("en-IN")}` : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Site Location & Problem Details Card */}
                <div className="mt-4">
                  <SiteLocationCard
                    location={assignment.siteLocation}
                    problem={assignment.problemDetails}
                    jobType={assignment.jobType}
                  />
                </div>

                {/* Site Photos Gallery */}
                {assignment.sitePhotos && assignment.sitePhotos.length > 0 && (
                  <div className="mt-4">
                    <SitePhotosGallery
                      photos={assignment.sitePhotos}
                      title="Site Photo Evidence & Readings"
                    />
                  </div>
                )}

                {/* Checklist SOP Section */}
                {checklist.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3">
                      <div className="flex items-center gap-2">
                        <ListChecks size={18} className="text-cyan-400" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-white">
                          Field SOP & Verification Steps
                        </h3>
                      </div>

                      <span className="text-[11px] font-bold text-cyan-400">
                        {completedChecklistCount} of {checklist.length} Completed ({checklistProgress}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 shadow-sm"
                        style={{ width: `${checklistProgress}%` }}
                      />
                    </div>

                    {/* Checklist Items */}
                    <div className="mt-3.5 space-y-2">
                      {checklist.map((item, idx) => (
                        <button
                          type="button"
                          key={item._id || idx}
                          disabled={isCompleted}
                          onClick={() => handleToggleSubTask(assignment._id, idx)}
                          className={`flex w-full items-start gap-3 rounded-xl border p-2.5 text-left text-xs transition cursor-pointer ${
                            item.completed
                              ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                              : isCompleted
                              ? "border-slate-800 bg-slate-900/40 text-slate-500 cursor-not-allowed"
                              : "border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          <span className="mt-0.5 shrink-0 text-cyan-400">
                            {item.completed ? (
                              <CheckSquare size={16} className="text-emerald-400" />
                            ) : (
                              <Square size={16} className="text-slate-500" />
                            )}
                          </span>

                          <span className={`flex-1 font-medium ${item.completed ? "line-through text-slate-400" : ""}`}>
                            {item.text}
                          </span>

                          {item.completed && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.2 rounded-full">
                              Verified
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operations & Attendance Actions Bottom Bar */}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4">
                  {/* Status description */}
                  <div>
                    {isCompleted ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <CheckCircle2 size={16} />
                        <span>
                          Work Order Complete & Verified
                          {assignment.finalOpticalPowerDbm !== undefined && ` · Final Power: ${assignment.finalOpticalPowerDbm} dBm`}
                        </span>
                      </div>
                    ) : isCheckedIn ? (
                      <div className="space-y-0.5">
                        <p className="text-xs text-cyan-400 font-bold flex items-center gap-1.5">
                          <Radio size={14} className="animate-pulse" />
                          Live on Field Site · Clocked In
                        </p>
                        {isPaused ? (
                          <p className="text-[11px] font-bold text-amber-400">
                            ⏸️ Shift Paused (Break in progress)
                          </p>
                        ) : dutyRecord?.totalPauseMinutes ? (
                          <p className="text-[10px] text-slate-400">
                            ({dutyRecord.totalPauseMinutes} mins break recorded)
                          </p>
                        ) : null}
                      </div>
                    ) : isPendingAcceptance ? (
                      <p className="text-xs text-amber-400 font-medium">
                        ⚠️ Please review work order location & accept or decline.
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400">
                        Accepted · Ready for dispatch & field clock-in.
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Accept / Decline for Pending Orders */}
                    {isPendingAcceptance && (
                      <>
                        <button
                          type="button"
                          disabled={processingId === assignment._id}
                          onClick={() => setDecliningDuty(assignment)}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-950/30 hover:bg-red-900/50 px-4 text-xs font-bold text-red-300 transition active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          Decline
                        </button>

                        <button
                          type="button"
                          disabled={processingId === assignment._id}
                          onClick={() => handleAccept(assignment._id)}
                          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 text-xs font-black text-slate-950 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-900/30"
                        >
                          {processingId === assignment._id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          Accept Order
                        </button>
                      </>
                    )}

                    {/* Clock In / Start Work */}
                    {!isPendingAcceptance && !isCheckedIn && !isCompleted && !isRejected && (
                      <button
                        type="button"
                        disabled={processingId === assignment._id}
                        onClick={() => handleCheckIn(assignment._id)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-5 text-xs font-black text-slate-950 transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-900/40"
                      >
                        {processingId === assignment._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Play size={14} />
                        )}
                        Clock In at Site
                      </button>
                    )}

                    {/* Active Controls: Pause, Resume, Complete */}
                    {isCheckedIn && (
                      <>
                        {isPaused ? (
                          <button
                            type="button"
                            disabled={processingId === assignment._id}
                            onClick={() => handleResumeShift(assignment._id)}
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 text-xs font-bold text-white transition disabled:opacity-50 cursor-pointer"
                          >
                            {processingId === assignment._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Play size={14} />
                            )}
                            Resume Work
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled={processingId === assignment._id}
                            onClick={() => setPausingDutyId(assignment._id)}
                            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-950/30 hover:bg-amber-900/50 px-4 text-xs font-bold text-amber-300 transition disabled:opacity-50 cursor-pointer"
                          >
                            <Pause size={14} />
                            Take Break
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={processingId === assignment._id}
                          onClick={() => setCompletingDuty(assignment)}
                          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 text-xs font-black text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-md shadow-emerald-900/30"
                        >
                          <CheckCircle2 size={14} />
                          Complete & Sign Off
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decline Modal */}
      {decliningDuty && (
        <DeclineShiftModal
          isOpen={Boolean(decliningDuty)}
          dutyTitle={decliningDuty.dutyTitle}
          onClose={() => setDecliningDuty(null)}
          onConfirm={(reason) => handleConfirmDecline(decliningDuty._id, reason)}
          loading={processingId === decliningDuty._id}
        />
      )}

      {/* Pause Modal */}
      {pausingDutyId && (
        <PauseShiftModal
          isOpen={Boolean(pausingDutyId)}
          onClose={() => setPausingDutyId(null)}
          onConfirm={(reason) => handleConfirmPause(pausingDutyId, reason)}
          loading={processingId === pausingDutyId}
        />
      )}

      {/* Complete Task Modal */}
      {completingDuty && (
        <CompleteTaskModal
          isOpen={Boolean(completingDuty)}
          dutyTitle={completingDuty.dutyTitle}
          onClose={() => setCompletingDuty(null)}
          onConfirm={(finalPower, notes) => handleConfirmComplete(completingDuty._id, finalPower, notes)}
          loading={processingId === completingDuty._id}
        />
      )}

      {/* Site Photos Upload Modal */}
      {photoUploadDuty && (
        <SitePhotosUploadModal
          isOpen={Boolean(photoUploadDuty)}
          dutyId={photoUploadDuty._id}
          dutyTitle={photoUploadDuty.dutyTitle}
          onClose={() => setPhotoUploadDuty(null)}
          onPhotoUploaded={() => {
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
}