import { LucideIcon } from "lucide-react";

interface ManagerStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  isCritical?: boolean;
}

export default function ManagerStatCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  isCritical = false,
}: ManagerStatCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
        isCritical
          ? "border-rose-500/30 bg-rose-950/20 shadow-rose-950/20"
          : "border-slate-800 bg-[#0f172a]/70 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {label}
          </p>
          <p className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isCritical
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : "bg-sky-500/10 text-[#00d2ff] border border-sky-500/20"
          }`}
        >
          <Icon size={20} strokeWidth={2} />
        </div>
      </div>

      {description && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px] text-slate-400">
          <span className="truncate">{description}</span>
          {trend && (
            <span className="font-semibold text-emerald-400 shrink-0 ml-1">
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}