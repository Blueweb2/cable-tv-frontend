"use client";

import { useState } from "react";
import { Coffee, Loader2, X, AlertCircle } from "lucide-react";

export const PAUSE_REASONS = [
  { id: "Break", label: "Break / Rest", icon: "☕" },
  { id: "Lunch", label: "Lunch / Meal", icon: "🍱" },
  { id: "Store Trip", label: "Material / Store Pickup", icon: "📦" },
  { id: "Waiting for instructions", label: "Waiting for NOC / Lead", icon: "⏳" },
  { id: "Other", label: "Other / Transit", icon: "📝" },
];

interface PauseShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: (reason: string, notes?: string) => Promise<void> | void;
  onConfirmPause?: (reason: string, notes?: string) => Promise<void> | void;
  loading?: boolean;
}

export default function PauseShiftModal({
  isOpen,
  onClose,
  onConfirm,
  onConfirmPause,
  loading = false,
}: PauseShiftModalProps) {
  const [selectedReason, setSelectedReason] = useState("Break");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const handler = onConfirmPause || onConfirm;
    if (!handler) {
      onClose();
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await handler(selectedReason, notes.trim());
      setNotes("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to pause shift."
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
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Coffee size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Pause Active Shift
              </h2>
              <p className="text-xs text-slate-400">
                Log temporary break or store transit
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

          {/* Reason Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Select Pause Reason
            </label>
            <div className="grid grid-cols-1 gap-2">
              {PAUSE_REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedReason(r.id)}
                  className={`flex items-center gap-3 rounded-xl border p-2.5 text-left text-xs font-bold transition cursor-pointer ${
                    selectedReason === r.id
                      ? "border-amber-500/50 bg-amber-950/30 text-amber-300"
                      : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <span className="text-base">{r.icon}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label
              htmlFor="pause-notes"
              className="block text-xs font-bold text-slate-300 mb-1.5"
            >
              Additional Notes (Optional)
            </label>
            <input
              id="pause-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Picking up 2x 1:8 fiber splitters from Central Store"
              disabled={isBusy}
              className="w-full rounded-xl border border-slate-700 bg-slate-900/90 p-3 text-xs text-white outline-none transition focus:border-amber-500 focus:ring-1 focus:ring-amber-500 placeholder:text-slate-500"
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
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-amber-950/30 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isBusy ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Pausing...</span>
                </>
              ) : (
                "Confirm Pause"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
