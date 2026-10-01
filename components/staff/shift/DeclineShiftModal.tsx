"use client";

import { useState } from "react";
import { AlertCircle, AlertTriangle, Calendar, Clock, Loader2, X } from "lucide-react";
import type { Assignment } from "@/types/assignment";

interface DeclineShiftModalProps {
  duty?: Assignment | null;
  dutyTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string, dutyId?: string) => Promise<void> | void;
  loading?: boolean;
}

export default function DeclineShiftModal({
  duty,
  dutyTitle,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: DeclineShiftModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const displayTitle =
    dutyTitle ||
    duty?.dutyTitle ||
    "Assigned Field Work Order";

  const zoneInfo =
    typeof duty?.zone === "object" && duty?.zone !== null
      ? `${duty.zone.zoneName || duty.zone.name || "Zone"} · Node ${duty.nodeNumber || duty.zone.zoneCode || duty.zone.code || "1"}`
      : duty?.siteLocation?.address || "Field Work Order";

  const dateFormatted = duty?.dutyDate
    ? new Date(duty.dutyDate).toLocaleDateString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Scheduled Date";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for declining this work order.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(reason.trim(), duty?._id);
      setReason("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to decline shift assignment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const isBusy = submitting || loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-[#0f172a] shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Decline Work Order
              </h2>
              <p className="text-xs text-slate-400">
                Notify NOC & Operations with your reason
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isBusy}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs text-red-300">
              <AlertCircle size={16} className="shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Shift Details Preview */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 text-xs space-y-1">
            <div className="font-bold text-white text-sm">{displayTitle}</div>
            <div className="text-cyan-400 text-[11px] font-semibold">{zoneInfo}</div>
            <div className="flex items-center gap-3 text-slate-400 pt-1 text-[11px]">
              <span className="inline-flex items-center gap-1">
                <Calendar size={13} className="text-cyan-400" />
                {dateFormatted}
              </span>
              {duty?.startTime && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} className="text-cyan-400" />
                    {duty.startTime} - {duty.endTime || "End"}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label
              htmlFor="decline-reason"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              Reason for Decline <span className="text-red-400">*</span>
            </label>
            <textarea
              id="decline-reason"
              rows={3}
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. In the middle of another fiber splice, vehicle breakdown, sickness..."
              disabled={isBusy}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs text-white outline-none transition focus:border-red-500 focus:ring-1 focus:ring-red-500 placeholder:text-slate-500 resize-none"
              required
            />
            <p className="mt-1 text-[10px] text-slate-400">
              This reason will be submitted to the Operations Manager for instant job reassignment.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isBusy}
              className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isBusy || !reason.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-red-950/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isBusy ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                "Confirm Decline"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
