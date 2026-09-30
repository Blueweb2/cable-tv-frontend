"use client";

import { useState, useEffect, useMemo } from "react";
import { CheckSquare, Square, Plus, CheckCircle2, ListTodo, Radio, ChevronDown, Activity, Zap, Cpu } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import { updateAssignmentChecklist } from "@/lib/assignment.api";
import { useAuth } from "@/hooks/useAuth";
import { formatTime24to12 } from "@/lib/duty-mapper";

interface ChecklistItem {
  _id?: string;
  text: string;
  completed: boolean;
}

interface InteractiveDutyChecklistProps {
  assignments?: Assignment[];
  assignment?: Assignment;
  onUpdate?: () => void;
}

const DEFAULT_SUBTASKS: Record<string, string[]> = {
  "Fiber Splicing": [
    "Verify safety gear & traffic cones",
    "Identify feeder / distribution core color",
    "Clean fiber strand with isopropyl alcohol",
    "Perform fusion splice & heat shrink sleeve",
    "Measure insertion loss via OTDR / Optical Meter (< 0.05dB target)",
    "Secure splice tray inside Joint Closure box",
  ],
  "Linesman / Field Tech": [
    "Locate Pole / DP box coordinates",
    "Check overhead drop wire tension & clearance",
    "Inspect RF tap / splitter dB output",
    "Replace damaged RG6 / Drop cable segment",
    "Crimping & weather-seal F-type connectors",
    "Verify STB / Modem RF lock & SNR status",
  ],
  "NOC & Network": [
    "Check OLT PON port optic power (-18dBm to -25dBm)",
    "Verify VLAN & PPPoE binding on Radius server",
    "Perform ping latency & packet loss diagnosis",
    "Update node optical distribution ledger",
  ],
  "Installation": [
    "Route drop cable neatly into customer premises",
    "Install and power on ONT / Dual-band WiFi Router",
    "Configure SSID, WPA3 security & PPPoE credentials",
    "Run Speedtest (Min 90% SLA bandwidth verified)",
    "Collect customer sign-off & capture site photos",
  ],
  Default: [
    "Review site location & problem diagnostics",
    "Check in at field site with GPS coordinates",
    "Inspect cable lines, splitters & distribution box",
    "Execute repair or installation",
    "Record optical power meter reading (dBm)",
    "Upload before & after site photo evidence",
  ],
};

const getZoneNodeName = (assignment?: Assignment): string => {
  if (!assignment) return "Network Site";
  if (typeof assignment.zone === "object" && assignment.zone !== null) {
    return `${assignment.zone.zoneName || "Zone"} · Node ${assignment.nodeNumber || assignment.zone.zoneCode || "1"}`;
  }
  return assignment.siteLocation?.address || "Field Work Order";
};

export default function InteractiveDutyChecklist({
  assignments = [],
  assignment: providedAssignment,
  onUpdate,
}: InteractiveDutyChecklistProps) {
  const { token } = useAuth();
  const [selectedId, setSelectedId] = useState<string>("");
  const [newItemText, setNewItemText] = useState("");
  const [loading, setLoading] = useState(false);

  // Filter valid active/accepted duties
  const validAssignments = useMemo(() => {
    if (assignments.length > 0) {
      return assignments.filter((a) => a.status !== "CANCELLED" && a.status !== "REJECTED");
    }
    return providedAssignment ? [providedAssignment] : [];
  }, [assignments, providedAssignment]);

  // Determine active or next upcoming assignment
  const activeOrNextAssignment = useMemo(() => {
    if (validAssignments.length === 0) return undefined;

    const inProgress = validAssignments.find((a) => a.status === "IN_PROGRESS");
    if (inProgress) return inProgress;

    const todayStr = new Date().toISOString().slice(0, 10);
    const upcoming = validAssignments
      .filter((a) => {
        const dStr = a.dutyDate ? new Date(a.dutyDate).toISOString().slice(0, 10) : "";
        return dStr >= todayStr || a.status === "ACCEPTED";
      })
      .sort((a, b) => {
        const dA = new Date(a.dutyDate).getTime();
        const dB = new Date(b.dutyDate).getTime();
        if (dA !== dB) return dA - dB;
        return (a.startTime || "").localeCompare(b.startTime || "");
      });

    if (upcoming.length > 0) return upcoming[0];

    return validAssignments[0];
  }, [validAssignments]);

  // Active selected duty
  const currentAssignment = useMemo(() => {
    if (selectedId) {
      const found = validAssignments.find((a) => a._id === selectedId);
      if (found) return found;
    }
    return activeOrNextAssignment || providedAssignment || validAssignments[0];
  }, [selectedId, validAssignments, activeOrNextAssignment, providedAssignment]);

  // Local checklist items state
  const [items, setItems] = useState<ChecklistItem[]>([]);

  useEffect(() => {
    if (!currentAssignment) {
      setItems([]);
      return;
    }

    if (currentAssignment.checklist && currentAssignment.checklist.length > 0) {
      setItems(currentAssignment.checklist);
    } else {
      const jobCategory = currentAssignment.jobType || currentAssignment.role || "Default";
      const defaults = DEFAULT_SUBTASKS[jobCategory] || DEFAULT_SUBTASKS.Default;
      const initialItems = defaults.map((text) => ({ text, completed: false }));
      setItems(initialItems);
      if (token && currentAssignment._id) {
        void updateAssignmentChecklist(currentAssignment._id, initialItems, token);
      }
    }
  }, [currentAssignment, token]);

  const completedCount = items.filter((i) => i.completed).length;
  const progressPct = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  const saveChecklist = async (updatedItems: ChecklistItem[]) => {
    if (!currentAssignment || !token) return;
    try {
      setLoading(true);
      await updateAssignmentChecklist(currentAssignment._id, updatedItems, token);
      onUpdate?.();
    } catch (err) {
      console.warn("Failed to persist checklist:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (index: number) => {
    const updated = items.map((item, i) => (i === index ? { ...item, completed: !item.completed } : item));
    setItems(updated);
    void saveChecklist(updated);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const updated = [...items, { text: newItemText.trim(), completed: false }];
    setItems(updated);
    setNewItemText("");
    void saveChecklist(updated);
  };

  if (!currentAssignment) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#0b1120] p-6 text-center text-slate-400">
        <ListTodo size={28} className="mx-auto text-slate-500" />
        <p className="mt-2 text-sm font-bold text-white">No Work Order Selected</p>
        <p className="mt-1 text-xs text-slate-400">Field procedure checklist will activate once a work order is selected.</p>
      </div>
    );
  }

  const isCompleted = currentAssignment.status === "COMPLETED";

  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-800 bg-[#0b1120] p-4 sm:p-5 shadow-lg">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800/80 pb-3.5">
        <div className="flex items-center gap-2 text-cyan-400">
          <ListTodo size={18} className="shrink-0" />
          <h2 className="text-sm sm:text-base font-bold text-white">Field Execution Checklist</h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-300 border border-slate-700">
              🔒 Completed
            </span>
          ) : currentAssignment.status === "IN_PROGRESS" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/20 animate-pulse">
              <Radio size={12} /> Active Job
            </span>
          ) : null}

          <span className="rounded-full bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 text-xs font-bold text-cyan-300">
            {completedCount}/{items.length} Done
          </span>
        </div>
      </div>

      {/* Multi-work order Selector */}
      {validAssignments.length > 1 && (
        <div className="mt-3.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Select Assigned Work Order:
          </label>
          <div className="relative mt-1">
            <select
              value={currentAssignment._id}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-2.5 pr-8 text-xs font-bold text-white outline-none transition focus:border-cyan-500"
            >
              {validAssignments.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.dutyTitle} — {getZoneNodeName(a)} ({a.status})
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      )}

      {/* Duty Details Sub-header */}
      <div className="mt-3.5 rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
        <p className="font-bold text-white break-words">{currentAssignment.dutyTitle}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5 sm:gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 min-w-0">
            <Cpu size={12} className="text-cyan-400 shrink-0" />
            <span className="truncate">{getZoneNodeName(currentAssignment)}</span>
          </span>
          <span className="flex items-center gap-1 shrink-0">
            <Zap size={12} className="text-amber-400 shrink-0" />
            <span>Priority: {currentAssignment.priority || "NORMAL"}</span>
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span>SOP Step Progress</span>
          <span className="font-bold text-cyan-400">{progressPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-300 shadow-sm"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* List */}
      <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
        {items.map((item, idx) => (
          <button
            key={item._id || idx}
            type="button"
            disabled={isCompleted || loading}
            onClick={() => toggleItem(idx)}
            className={`flex w-full items-center justify-between gap-2.5 rounded-xl border p-3 text-left text-xs transition cursor-pointer ${
              isCompleted ? "cursor-not-allowed opacity-80" : "active:scale-[0.99]"
            } ${
              item.completed
                ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-300"
                : "border-slate-800 bg-slate-900/50 text-slate-200 hover:border-slate-700"
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0 pr-1">
              {item.completed ? (
                <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-400" />
              ) : (
                <Square size={17} className="mt-0.5 shrink-0 text-slate-500" />
              )}
              <span className={`break-words font-medium leading-snug ${item.completed ? "line-through text-slate-500" : ""}`}>
                {item.text}
              </span>
            </div>
            {item.completed && (
              <span className="shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                Verified
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add Custom Subtask Form / Completed Locked Notice */}
      {isCompleted ? (
        <div className="mt-4 flex items-center justify-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/50 p-2.5 text-xs font-semibold text-slate-400">
          <span>🔒 Work Order is completed. SOP steps are locked.</span>
        </div>
      ) : (
        <form onSubmit={handleAddItem} className="mt-4 flex gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add custom task / step..."
            className="h-10 flex-1 rounded-xl border border-slate-700 bg-slate-900/90 px-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
          <button
            type="submit"
            disabled={!newItemText.trim() || loading}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 text-xs font-bold text-white transition active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm shadow-cyan-900/40"
          >
            <Plus size={15} />
            <span className="hidden xs:inline">Add</span>
          </button>
        </form>
      )}
    </div>
  );
}


