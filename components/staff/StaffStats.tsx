import { CalendarDays, CheckCircle2, ClipboardList, Clock3 } from "lucide-react";
import type { Assignment } from "@/types/assignment";
import type { Attendance } from "@/types/attendance";

export default function StaffStats({
  assignments,
  attendance,
}: {
  assignments: Assignment[];
  attendance: Attendance[];
}) {
  const pending = assignments.filter(
    (item) => !["COMPLETED", "CANCELLED"].includes(item.status)
  ).length;
  const completed = assignments.filter(
    (item) => item.status === "COMPLETED"
  ).length;
  const hours = attendance.reduce((total, item) => {
    if (!item.checkIn || !item.checkOut) return total;
    return (
      total +
      (new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime()) /
        3600000
    );
  }, 0);
  const eventCount = new Set(
    assignments.map((item) =>
      typeof item.event === "string" ? item.event : item.event._id
    )
  ).size;

  const stats = [
    {
      label: "Pending Duties",
      value: pending,
      icon: ClipboardList,
      color: "text-amber-400 bg-amber-950/40 border border-amber-500/30",
    },
    {
      label: "Assigned Events",
      value: eventCount,
      icon: CalendarDays,
      color: "text-blue-400 bg-blue-950/40 border border-blue-500/30",
    },
    {
      label: "Completed",
      value: completed,
      icon: CheckCircle2,
      color: "text-emerald-400 bg-emerald-950/40 border border-emerald-500/30",
    },
    {
      label: "Recorded Hours",
      value: `${hours.toFixed(1)}h`,
      icon: Clock3,
      color: "text-purple-400 bg-purple-950/40 border border-purple-500/30",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/50 p-3.5 sm:p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-1.5">
              <span className="truncate text-[11px] font-semibold text-slate-400">
                {stat.label}
              </span>
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
              >
                <Icon size={15} />
              </div>
            </div>
            <p className="mt-2 text-xl font-black text-white sm:text-2xl">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

