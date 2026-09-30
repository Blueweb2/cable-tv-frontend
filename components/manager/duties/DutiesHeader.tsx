"use client";

import { Wrench, Download, Plus } from "lucide-react";

interface DutiesHeaderProps {
  onAddDuty: () => void;
  onExportRoster?: () => void;
}

export default function DutiesHeader({
  onAddDuty,
  onExportRoster,
}: DutiesHeaderProps) {
  return (
    <header className="border-b border-slate-800 pb-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-[#00d2ff] border border-sky-500/20">
              <Wrench size={14} />
            </span>

            <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Field Operations Control
            </p>
          </div>

          <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-white">
            Field Jobs & Work Orders
          </h1>

          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-400">
            Dispatch technicians to line maintenance, subscriber installations, and track job completion checklists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onExportRoster && (
            <button
              type="button"
              onClick={onExportRoster}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white"
            >
              <Download size={15} className="text-sky-400 shrink-0" />
              <span>Export Work Orders (CSV)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAddDuty}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition hover:from-sky-500 hover:to-cyan-500"
          >
            <Plus size={16} className="shrink-0" />
            <span>Dispatch Work Order</span>
          </button>
        </div>
      </div>
    </header>
  );
}