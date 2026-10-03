"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FileText,
  UserRound,
  Radio,
  Wrench,
  AlertTriangle,
} from "lucide-react";

import type {
  Assignment,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  JobType,
  PriorityLevel,
} from "@/types/assignment";

interface AssignmentFormProps {
  assignment?: Assignment | null;
  onSubmit: (
    payload: CreateAssignmentPayload | UpdateAssignmentPayload
  ) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormState {
  zone: string;
  zoneName: string;
  nodeNumber: string;
  staff: string;
  dutyTitle: string;
  jobType: JobType;
  priority: PriorityLevel;
  role: string;
  description: string;
  dutyDate: string;
  startTime: string;
  endTime: string;
  notes: string;
}

const initialForm: FormState = {
  zone: "",
  zoneName: "",
  nodeNumber: "",
  staff: "",
  dutyTitle: "",
  jobType: "GENERAL_SHIFT",
  priority: "MEDIUM",
  role: "",
  description: "",
  dutyDate: "",
  startTime: "",
  endTime: "",
  notes: "",
};

export default function AssignmentForm({
  assignment,
  onSubmit,
  onCancel,
  loading = false,
}: AssignmentFormProps) {
  const isEditing = Boolean(assignment);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!assignment) {
      setForm(initialForm);
      return;
    }

    setForm({
      zone:
        typeof assignment.zone === "string"
          ? assignment.zone
          : assignment.zone?._id || "",
      zoneName: assignment.zoneName || "",
      nodeNumber: assignment.nodeNumber || "",
      staff:
        typeof assignment.staff === "string"
          ? assignment.staff
          : assignment.staff.id || (assignment.staff as any)._id || "",
      dutyTitle: assignment.dutyTitle ?? "",
      jobType: assignment.jobType ?? "GENERAL_SHIFT",
      priority: assignment.priority ?? "MEDIUM",
      role: assignment.role ?? "",
      description: assignment.description ?? "",
      dutyDate: formatDateForInput(assignment.dutyDate),
      startTime: assignment.startTime ?? "",
      endTime: assignment.endTime ?? "",
      notes: assignment.notes ?? "",
    });
  }, [assignment]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.staff.trim()) {
      setError("Please enter the technician staff ID.");
      return;
    }

    if (!form.dutyTitle.trim()) {
      setError("Duty title is required.");
      return;
    }

    if (!form.dutyDate) {
      setError("Duty date is required.");
      return;
    }

    if (!form.startTime) {
      setError("Start time is required.");
      return;
    }

    if (!form.endTime) {
      setError("End time is required.");
      return;
    }

    try {
      if (isEditing) {
        const payload: UpdateAssignmentPayload = {
          zone: form.zone.trim() || undefined,
          zoneName: form.zoneName.trim() || undefined,
          nodeNumber: form.nodeNumber.trim() || undefined,
          staff: form.staff.trim(),
          dutyTitle: form.dutyTitle.trim(),
          jobType: form.jobType,
          priority: form.priority,
          role: form.role.trim() || undefined,
          description: form.description.trim() || undefined,
          dutyDate: form.dutyDate,
          startTime: form.startTime,
          endTime: form.endTime,
          notes: form.notes.trim() || undefined,
        };

        await onSubmit(payload);
      } else {
        const payload: CreateAssignmentPayload = {
          zone: form.zone.trim() || undefined,
          zoneName: form.zoneName.trim() || undefined,
          nodeNumber: form.nodeNumber.trim() || undefined,
          staff: form.staff.trim(),
          dutyTitle: form.dutyTitle.trim(),
          jobType: form.jobType,
          priority: form.priority,
          role: form.role.trim() || undefined,
          description: form.description.trim() || undefined,
          dutyDate: form.dutyDate,
          startTime: form.startTime,
          endTime: form.endTime,
          notes: form.notes.trim() || undefined,
        };

        await onSubmit(payload);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save field assignment."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-slate-100">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Wrench size={18} className="text-cyan-400" />
          {isEditing ? "Edit Field Assignment" : "Dispatch Field Duty"}
        </h2>
        <p className="mt-1 text-xs leading-5 text-slate-400">
          {isEditing
            ? "Update work order assignment details and schedule."
            : "Assign a field technician to network zone maintenance or client work order."}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3"
        >
          <p className="text-xs leading-5 text-red-300">{error}</p>
        </div>
      )}

      {/* Duty Title */}
      <div>
        <label
          htmlFor="assignment-duty-title"
          className="mb-1.5 block text-xs font-semibold text-slate-300"
        >
          Duty / Work Order Title *
        </label>
        <input
          id="assignment-duty-title"
          type="text"
          required
          value={form.dutyTitle}
          onChange={(e) => handleChange("dutyTitle", e.target.value)}
          disabled={loading}
          placeholder="e.g. Fiber Core Splicing & Node Calibration"
          className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-cyan-500 disabled:opacity-50"
        />
      </div>

      {/* Job Type & Priority */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Job Category
          </label>
          <select
            value={form.jobType}
            onChange={(e) => handleChange("jobType", e.target.value)}
            disabled={loading}
            className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-cyan-500 disabled:opacity-50"
          >
            <option value="FIBER_SPLICING">Fiber Splicing & OTDR</option>
            <option value="LINE_REPAIR">Line Repair & Drop Cable</option>
            <option value="NEW_INSTALLATION">New FTTH & STB Setup</option>
            <option value="NODE_MAINTENANCE">Node & Amplifier Maintenance</option>
            <option value="SIGNAL_OPTIMIZATION">Signal Level Optimization</option>
            <option value="PAYMENT_COLLECTION">Payment Collection</option>
            <option value="GENERAL_SHIFT">General Field Shift</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Priority Level
          </label>
          <select
            value={form.priority}
            onChange={(e) => handleChange("priority", e.target.value)}
            disabled={loading}
            className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-cyan-500 disabled:opacity-50"
          >
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High Priority</option>
            <option value="CRITICAL_OUTAGE">Critical Outage</option>
          </select>
        </div>
      </div>

      {/* Staff */}
      <div>
        <label
          htmlFor="assignment-staff"
          className="mb-1.5 block text-xs font-semibold text-slate-300"
        >
          Technician ID *
        </label>
        <div className="relative">
          <UserRound
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            id="assignment-staff"
            type="text"
            required
            value={form.staff}
            onChange={(e) => handleChange("staff", e.target.value)}
            disabled={loading}
            placeholder="Enter technician user ID"
            className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 text-xs text-white outline-none focus:border-cyan-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label
            htmlFor="assignment-date"
            className="mb-1.5 block text-xs font-semibold text-slate-300"
          >
            Duty Date *
          </label>
          <input
            id="assignment-date"
            type="date"
            required
            value={form.dutyDate}
            onChange={(e) => handleChange("dutyDate", e.target.value)}
            disabled={loading}
            className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs text-white outline-none focus:border-cyan-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label
            htmlFor="assignment-start-time"
            className="mb-1.5 block text-xs font-semibold text-slate-300"
          >
            Start Time *
          </label>
          <div className="relative">
            <Clock3
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              id="assignment-start-time"
              type="time"
              required
              value={form.startTime}
              onChange={(e) => handleChange("startTime", e.target.value)}
              disabled={loading}
              className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-2 text-xs text-white outline-none focus:border-cyan-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="assignment-end-time"
            className="mb-1.5 block text-xs font-semibold text-slate-300"
          >
            End Time *
          </label>
          <div className="relative">
            <Clock3
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              id="assignment-end-time"
              type="time"
              required
              value={form.endTime}
              onChange={(e) => handleChange("endTime", e.target.value)}
              disabled={loading}
              className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900 pl-9 pr-2 text-xs text-white outline-none focus:border-cyan-500 disabled:opacity-50"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="assignment-description"
          className="mb-1.5 block text-xs font-semibold text-slate-300"
        >
          Description / Special Instructions
        </label>
        <textarea
          id="assignment-description"
          rows={3}
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          disabled={loading}
          placeholder="Detailed problem description or instructions for the technician..."
          className="w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs text-white outline-none focus:border-cyan-500 disabled:opacity-50"
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="h-10 rounded-xl border border-slate-700 px-4 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="h-10 rounded-xl bg-cyan-600 px-5 text-xs font-bold text-slate-950 hover:bg-cyan-500 disabled:opacity-50 shadow-sm"
        >
          {loading
            ? "Saving..."
            : isEditing
            ? "Update Field Duty"
            : "Dispatch Field Duty"}
        </button>
      </div>
    </form>
  );
}

function formatDateForInput(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().slice(0, 10);
  } catch {
    return dateStr.slice(0, 10);
  }
}