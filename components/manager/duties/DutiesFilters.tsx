"use client";

import { Search, X } from "lucide-react";
import { type DutyStatus } from "./constants";

interface DutiesFiltersProps {
  search: string;
  status: "All" | DutyStatus;
  onSearchChange: (value: string) => void;
  onStatusChange: (status: "All" | DutyStatus) => void;
  onClear: () => void;
}

const statusOptions: Array<"All" | DutyStatus> = [
  "All",
  "ASSIGNED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
];

const statusLabels: Record<string, string> = {
  All: "All Orders",
  ASSIGNED: "Pending Dispatch",
  ACCEPTED: "Accepted",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  REJECTED: "Declined",
};

export default function DutiesFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onClear,
}: DutiesFiltersProps) {
  const hasFilters = Boolean(search || status !== "All");

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/70 p-3 sm:p-4 shadow-sm space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search work orders, zones, technician names or locations..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-700 bg-slate-900 pl-10 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-sky-500"
          />
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 text-xs font-semibold text-slate-300 hover:bg-slate-700 hover:text-white"
          >
            <X size={14} />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      {/* Filter Badges */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
        {statusOptions.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onStatusChange(opt)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              status === opt
                ? "bg-sky-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {statusLabels[opt] || opt}
          </button>
        ))}
      </div>
    </section>
  );
}