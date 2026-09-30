"use client";

import { ClipboardList, Wrench } from "lucide-react";
import type { Duty } from "./constants";
import DutyCard from "./DutyCard";

interface DutiesListProps {
  duties: Duty[];
  loading?: boolean;
  onEdit: (duty: Duty) => void;
  onDelete: (duty: Duty) => void;
  onStatusChange: (duty: Duty) => void;
  onToggleChecklist?: (dutyId: string, updatedChecklist: Array<{ _id?: string; text: string; completed: boolean }>) => void;
  onManageChecklist?: (duty: Duty) => void;
}

export default function DutiesList({
  duties,
  loading = false,
  onEdit,
  onDelete,
  onStatusChange,
  onToggleChecklist,
  onManageChecklist,
}: DutiesListProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white">
            Work Orders & Field Runs
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            {duties.length} {duties.length === 1 ? "work order" : "work orders"} active
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/50 px-6 py-14 text-center text-xs text-slate-400">
          <div className="mx-auto mb-2 h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          Loading work orders...
        </div>
      ) : duties.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0f172a]/30 px-6 py-14 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 text-[#00d2ff]">
            <Wrench size={22} />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-white">
            No work orders found
          </h3>

          <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-400">
            Try adjusting your search criteria or create a new field assignment.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {duties.map((duty) => (
            <DutyCard
              key={duty.id}
              duty={duty}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onToggleChecklist={onToggleChecklist}
              onManageChecklist={onManageChecklist}
            />
          ))}
        </div>
      )}
    </section>
  );
}
