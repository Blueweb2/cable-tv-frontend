import {
  CheckCircle2,
  ClipboardList,
  Clock3,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import type { Duty } from "./constants";

interface DutiesStatsProps {
  duties: Duty[];
}

export default function DutiesStats({ duties }: DutiesStatsProps) {
  const rejectedCount = duties.filter((d) => d.status === "REJECTED").length;
  const pendingCount = duties.filter((d) => d.status === "ASSIGNED").length;
  const confirmedCount = duties.filter((d) => ["ACCEPTED", "IN_PROGRESS"].includes(d.status)).length;
  const completedCount = duties.filter((d) => d.status === "COMPLETED").length;

  const stats = [
    {
      label: "Total Work Orders",
      value: duties.length,
      icon: ClipboardList,
      description: "Active field assignments",
    },
    {
      label: "Active In-Field",
      value: confirmedCount,
      icon: UserCheck,
      description: "Technicians on location",
    },
    {
      label: rejectedCount > 0 ? "Declined Orders" : "Pending Confirmation",
      value: rejectedCount > 0 ? rejectedCount : pendingCount,
      icon: rejectedCount > 0 ? AlertTriangle : Clock3,
      description: rejectedCount > 0 ? "Requires reassignment" : "Awaiting tech response",
      isAlert: rejectedCount > 0,
    },
    {
      label: "Completed Jobs",
      value: completedCount,
      icon: CheckCircle2,
      description: "Resolved & checked-off",
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className={`rounded-2xl border p-4 sm:p-5 shadow-sm transition hover:border-slate-700 ${
              stat.isAlert
                ? "border-rose-500/30 bg-rose-950/20"
                : "border-slate-800 bg-[#0f172a]/70"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p
                  className={`truncate text-xs font-semibold uppercase tracking-wider ${
                    stat.isAlert ? "text-rose-400 font-bold" : "text-slate-400"
                  }`}
                >
                  {stat.label}
                </p>

                <p
                  className={`mt-1 text-2xl font-black sm:text-3xl ${
                    stat.isAlert ? "text-rose-300" : "text-white"
                  }`}
                >
                  {stat.value}
                </p>
              </div>

              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  stat.isAlert
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-sky-500/10 text-[#00d2ff] border border-sky-500/20"
                }`}
              >
                <Icon size={18} />
              </span>
            </div>

            <p className="mt-2.5 truncate text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              {stat.description}
            </p>
          </div>
        );
      })}
    </section>
  );
}
