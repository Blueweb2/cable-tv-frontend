"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, X, AlertCircle, Activity, FileText } from "lucide-react";

interface CompleteTaskModalProps {
  dutyTitle?: string;
  taskTitle?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalOpticalPowerDbm?: string | number, completionNotes?: string) => Promise<void> | void;
  loading?: boolean;
}

export default function CompleteTaskModal({
  dutyTitle,
  taskTitle,
  isOpen,
  onClose,
  onConfirm,
  loading = false,
}: CompleteTaskModalProps) {
  const [opticalPower, setOpticalPower] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const displayTitle = dutyTitle || taskTitle || "Field Work Order";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(opticalPower.trim() || undefined, notes.trim() || undefined);
      setOpticalPower("");
      setNotes("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign off and complete work order."
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Sign Off & Complete Job
              </h2>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">
                {displayTitle}
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

          {/* Final Optical Power Meter Reading */}
          <div>
            <label
              htmlFor="optical-power-input"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5"
            >
              <Activity size={14} className="text-cyan-400" />
              <span>Final Optical Power Reading (dBm)</span>
            </label>
            <input
              id="optical-power-input"
              type="text"
              value={opticalPower}
              onChange={(e) => setOpticalPower(e.target.value)}
              placeholder="e.g. -18.5 dBm or -19"
              disabled={isBusy}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs text-white outline-none transition focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-slate-500 font-mono"
            />
            <p className="mt-1 text-[10px] text-slate-400">Target PON Rx range: -15 dBm to -24 dBm</p>
          </div>

          {/* Resolution Summary / Completion Remarks */}
          <div>
            <label
              htmlFor="task-completion-notes"
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 mb-1.5"
            >
              <FileText size={14} className="text-emerald-400" />
              <span>Resolution Summary & Notes</span>
            </label>
            <textarea
              id="task-completion-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Spliced 4-core drop cable at Pole #14. Loss measured at 0.02 dB. Subscriber WiFi & STB tested operational."
              disabled={isBusy}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs text-white outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-500 resize-none"
            />
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
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-emerald-950/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isBusy ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Sign Off Work Order</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
