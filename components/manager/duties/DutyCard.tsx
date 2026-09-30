"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  ListChecks,
  MapPin,
  MoreVertical,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  UserX,
  UserCheck,
  RefreshCw,
  Radio,
  Wrench,
  Zap,
} from "lucide-react";
import { useState } from "react";

import type { Duty } from "./constants";
import { formatTime24to12 } from "@/lib/duty-mapper";

interface DutyCardProps {
  duty: Duty;
  onEdit: (duty: Duty) => void;
  onDelete: (duty: Duty) => void;
  onStatusChange: (duty: Duty) => void;
  onToggleChecklist?: (dutyId: string, updatedChecklist: Array<{ _id?: string; text: string; completed: boolean }>) => void;
  onManageChecklist?: (duty: Duty) => void;
}

export default function DutyCard({
  duty,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleChecklist,
  onManageChecklist,
}: DutyCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  const checklistItems = duty.checklist || [];
  const completedCount = checklistItems.filter((i) => i.completed).length;
  const totalCount = checklistItems.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const statusClasses: Record<string, string> = {
    ASSIGNED: "bg-amber-500/10 text-amber-400 border border-amber-500/30",
    ACCEPTED: "bg-sky-500/10 text-sky-400 border border-sky-500/30 font-bold",
    REJECTED: "bg-rose-500/10 text-rose-400 border border-rose-500/30 font-bold",
    IN_PROGRESS: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold",
    COMPLETED: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/30",
    CANCELLED: "bg-slate-800 text-slate-400 border border-slate-700",
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ASSIGNED":
        return "Dispatched / Pending";
      case "ACCEPTED":
        return "Accepted by Tech";
      case "REJECTED":
        return "Declined by Tech";
      case "IN_PROGRESS":
        return "In Progress • Live";
      case "COMPLETED":
        return "Work Completed ✓";
      case "CANCELLED":
        return "Cancelled";
      default:
        return status;
    }
  };

  const handleCheckitemClick = (index: number) => {
    if (!onToggleChecklist) return;
    const updated = checklistItems.map((item, i) =>
      i === index ? { ...item, completed: !item.completed } : item
    );
    onToggleChecklist(duty.id, updated);
  };

  return (
    <article className="w-full min-w-0 rounded-2xl border border-slate-800 bg-[#0f172a]/80 p-4 shadow-md transition hover:border-slate-700 hover:shadow-lg sm:p-5 flex flex-col justify-between text-slate-100">
      <div>
        {/* Top Header */}
        <div className="flex items-start gap-3 justify-between">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                duty.status === "REJECTED"
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  : duty.status === "IN_PROGRESS"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-sky-500/15 text-[#00d2ff] border border-sky-500/30"
              }`}
            >
              <Wrench size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-sm text-white truncate leading-snug">
                  {duty.title}
                </h3>
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] ${
                    statusClasses[duty.status] || "bg-slate-800 text-slate-300"
                  }`}
                >
                  {duty.status === "IN_PROGRESS" && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  {getStatusLabel(duty.status)}
                </span>

                {duty.event && (
                  <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20 truncate max-w-[160px]">
                    {duty.event}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <MoreVertical size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 top-8 z-20 w-44 rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-xl text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(duty);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-200 hover:bg-slate-800"
                >
                  <Edit3 size={14} /> Edit Work Order
                </button>
                {onManageChecklist && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onManageChecklist(duty);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-200 hover:bg-slate-800"
                  >
                    <ListChecks size={14} /> Manage Checklist
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(duty);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-400 hover:bg-rose-950/40"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details grid */}
        <div className="mt-3.5 space-y-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <User size={13} className="text-sky-400" /> Technician:
            </span>
            <span className="font-semibold text-slate-200">{duty.staffName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-400">
              <CalendarDays size={13} className="text-cyan-400" /> Date & Time:
            </span>
            <span className="font-semibold text-slate-200">
              {duty.eventDate} ({formatTime24to12(duty.startTime)} - {formatTime24to12(duty.endTime)})
            </span>
          </div>

          {duty.location && (
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-400">
                <MapPin size={13} className="text-emerald-400" /> Location:
              </span>
              <span className="font-semibold text-slate-200 truncate max-w-[180px]">
                {duty.location}
              </span>
            </div>
          )}
        </div>

        {/* Interactive Checklist Bar */}
        {totalCount > 0 && (
          <div className="mt-3.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 text-xs">
            <button
              type="button"
              onClick={() => setShowChecklist(!showChecklist)}
              className="flex w-full items-center justify-between font-semibold text-slate-300 hover:text-white"
            >
              <span className="flex items-center gap-1.5">
                <ListChecks size={14} className="text-[#00d2ff]" />
                Field Tasks ({completedCount}/{totalCount})
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-sky-400 font-mono font-bold">
                  {progressPercent}%
                </span>
                {showChecklist ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </div>
            </button>

            {/* Progress Bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Collapsible items */}
            {showChecklist && (
              <div className="mt-2.5 space-y-1.5 border-t border-slate-800 pt-2">
                {checklistItems.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCheckitemClick(idx)}
                    className="flex w-full items-center gap-2 text-left text-[11px] text-slate-300 hover:text-white transition"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        item.completed
                          ? "bg-sky-500 border-sky-400 text-white"
                          : "border-slate-600 bg-slate-800"
                      }`}
                    >
                      {item.completed && <CheckCircle2 size={12} />}
                    </span>
                    <span className={item.completed ? "line-through text-slate-500" : ""}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Status Button */}
      <div className="mt-4 border-t border-slate-800 pt-3">
        {duty.status !== "COMPLETED" && duty.status !== "CANCELLED" && duty.status !== "REJECTED" ? (
          <button
            type="button"
            onClick={() => onStatusChange(duty)}
            className="w-full rounded-xl bg-slate-800 border border-slate-700 py-2 text-xs font-bold text-sky-400 transition hover:bg-slate-700 hover:text-white active:scale-98"
          >
            {duty.status === "ASSIGNED" || duty.status === "ACCEPTED"
              ? "Set In-Progress ▶"
              : "Mark Work Completed ✓"}
          </button>
        ) : (
          <div className="text-center text-[11px] font-semibold text-slate-500">
            {duty.status === "COMPLETED" ? "Work Order Settled" : "Work Order Inactive"}
          </div>
        )}
      </div>
    </article>
  );
}
