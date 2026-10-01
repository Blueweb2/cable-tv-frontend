"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CalendarDays,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  TrendingUp,
  Wallet,
  Users,
  Clock,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from "lucide-react";
import PageHeader from "@/components/common/PageHeader";
import { getExpenses } from "@/lib/expense.api";
import { getAssignments } from "@/lib/assignment.api";
import { useReports } from "@/hooks/useReports";
import { useAuth } from "@/hooks/useAuth";
import type { Expense } from "@/components/manager/expenses/constants";
import type { Assignment } from "@/types/assignment";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));

export default function ReportsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { token } = useAuth();
  const { analytics, fetchAnalytics } = useReports({ token, autoFetch: true });

  const loadReports = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError("");
      const [assignmentResult, expenseResult] = await Promise.all([
        getAssignments(token, { page: 1, limit: 100 }),
        getExpenses(),
      ]);
      setAssignments(assignmentResult.data || []);
      setExpenses(expenseResult || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const refreshAll = async () => {
    await Promise.all([loadReports(), fetchAnalytics()]);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => void loadReports(), 0);
    return () => window.clearTimeout(timer);
  }, [loadReports]);

  const inRange = useCallback(
    (value: string) => {
      const date = value.slice(0, 10);
      return (!fromDate || date >= fromDate) && (!toDate || date <= toDate);
    },
    [fromDate, toDate]
  );

  const filteredAssignments = useMemo(
    () => assignments.filter((duty) => inRange(duty.dutyDate)),
    [assignments, inRange]
  );

  const filteredExpenses = useMemo(
    () => expenses.filter((expense) => inRange(expense.date)),
    [expenses, inRange]
  );

  const metrics = useMemo(() => {
    const totalDuties = filteredAssignments.length;
    const completedDuties = filteredAssignments.filter((d) => d.status === "COMPLETED").length;
    const inProgressDuties = filteredAssignments.filter((d) => d.status === "IN_PROGRESS").length;
    const criticalOutages = filteredAssignments.filter((d) => d.priority === "CRITICAL_OUTAGE").length;
    const totalHours = filteredAssignments.reduce((sum, d) => sum + (d.totalHours || 0), 0);
    const spending = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    return {
      totalDuties,
      completedDuties,
      inProgressDuties,
      criticalOutages,
      totalHours: Math.round(totalHours * 10) / 10,
      spending,
      completionRate: totalDuties > 0 ? Math.round((completedDuties / totalDuties) * 100) : 0,
    };
  }, [filteredAssignments, filteredExpenses]);

  const dutyStatuses = useMemo(() => {
    const statuses = ["ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "REJECTED", "CANCELLED"] as const;
    return statuses.map((status) => ({
      status: status.replace("_", " "),
      count: filteredAssignments.filter((duty) => duty.status === status).length,
    }));
  }, [filteredAssignments]);

  const jobTypeBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    filteredAssignments.forEach((duty) => {
      const key = duty.jobType?.replace("_", " ") || "GENERAL SHIFT";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
  }, [filteredAssignments]);

  const exportReport = () => {
    const rows = [
      ["Report Type", "Date", "Title / Item", "Zone / Node", "Status", "Priority", "Amount / Hours"],
      ...filteredAssignments.map((duty) => [
        "Work Order",
        duty.dutyDate?.slice(0, 10) || "",
        duty.dutyTitle,
        duty.zoneName || "General",
        duty.status,
        duty.priority || "MEDIUM",
        `${duty.totalHours || 0} hrs`,
      ]),
      ...filteredExpenses.map((expense) => [
        "Expense Claim",
        expense.date,
        expense.title,
        expense.event || "General",
        expense.status,
        expense.category,
        String(expense.amount),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "cableops-operations-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="space-y-6">
      <PageHeader
        title="Field Operations & Network Reports"
        description="Comprehensive analytics on work order completion, technician hours, outage resolutions, and field expenses."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void refreshAll()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700 disabled:opacity-50"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              type="button"
              onClick={exportReport}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:from-sky-500 hover:to-cyan-500 disabled:opacity-50"
            >
              <Download size={15} />
              Export CSV
            </button>
          </div>
        }
      />

      {/* Date Range Selector */}
      <section className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm sm:flex-row sm:items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-300">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1 h-9 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs text-white focus:border-sky-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1 h-9 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs text-white focus:border-sky-500 focus:outline-none"
          />
        </div>
        {(fromDate || toDate) && (
          <button
            type="button"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="h-9 px-3 text-xs font-semibold text-sky-400 hover:text-sky-300"
          >
            Clear Filter
          </button>
        )}
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/60">
          <Loader2 className="animate-spin text-sky-400" size={26} />
        </div>
      ) : (
        <>
          {/* Top KPI Metrics Bar */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <Metric
              icon={<FileText size={18} />}
              label="Total Work Orders"
              value={String(metrics.totalDuties)}
              tone="blue"
            />
            <Metric
              icon={<CheckCircle2 size={18} />}
              label="Completed Duties"
              value={`${metrics.completedDuties} (${metrics.completionRate}%)`}
              tone="green"
            />
            <Metric
              icon={<Activity size={18} />}
              label="In-Progress Shifts"
              value={String(metrics.inProgressDuties)}
              tone="cyan"
            />
            <Metric
              icon={<AlertTriangle size={18} />}
              label="Critical Outages"
              value={String(metrics.criticalOutages)}
              tone={metrics.criticalOutages > 0 ? "red" : "green"}
            />
            <Metric
              icon={<Clock size={18} />}
              label="Total Field Hours"
              value={`${analytics?.totalStaffHours || metrics.totalHours}h`}
              tone="gold"
            />
            <Metric
              icon={<Wallet size={18} />}
              label="Recorded Expenses"
              value={formatCurrency(metrics.spending || analytics?.totalExpenses || 0)}
              tone="gold"
            />
          </section>

          {/* Graphical Breakdown Panels */}
          <section className="grid gap-6 xl:grid-cols-2">
            <ReportPanel title="Work Order Status Distribution" icon={<CalendarDays size={18} />}>
              <Bars items={dutyStatuses.map((item) => ({ label: item.status, value: item.count }))} color="bg-sky-500" />
            </ReportPanel>

            <ReportPanel title="Job Type & Maintenance Breakdown" icon={<Radio size={18} />}>
              <Bars items={jobTypeBreakdown} color="bg-cyan-500" />
            </ReportPanel>
          </section>

          {/* Recent Operations Activity Log */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white">Recent Field Operations Activity</h2>
                <p className="mt-0.5 text-xs text-slate-400">Work orders, technician dispatches, and material expense claims.</p>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {filteredAssignments.length + filteredExpenses.length} entries
              </span>
            </div>

            <div className="mt-4 divide-y divide-slate-800/80">
              {[
                ...filteredAssignments.map((duty) => ({
                  date: duty.dutyDate || "",
                  title: duty.dutyTitle,
                  type: "Work Order",
                  status: duty.status,
                  subtitle: `${duty.zoneName || "Zone Operations"} · ${duty.totalHours || 0}h`,
                  isNegative: false,
                })),
                ...filteredExpenses.map((expense) => ({
                  date: expense.date,
                  title: expense.title,
                  type: "Expense Claim",
                  status: expense.status,
                  subtitle: `${expense.category} · ${formatCurrency(expense.amount)}`,
                  isNegative: true,
                })),
              ]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 10)
                .map((item, idx) => (
                  <div key={`${item.type}-${item.date}-${idx}`} className="flex items-center justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm font-semibold text-white">{item.title}</p>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {item.type} · {item.date ? formatDate(item.date) : "Recent"} · {item.subtitle}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          item.status === "COMPLETED" || item.status === "Paid"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : item.status === "IN_PROGRESS"
                            ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function Metric({
  icon,
  label,
  value,
  tone = "blue",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: "blue" | "cyan" | "green" | "red" | "gold";
}) {
  const styles = {
    blue: "bg-sky-950/40 text-sky-400 border border-sky-500/20",
    cyan: "bg-cyan-950/40 text-cyan-400 border border-cyan-500/20",
    green: "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20",
    red: "bg-rose-950/40 text-rose-400 border border-rose-500/20",
    gold: "bg-amber-950/40 text-amber-400 border border-amber-500/20",
  };

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm">
      <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${styles[tone]}`}>{icon}</div>
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-base sm:text-lg font-black text-white">{value}</p>
    </article>
  );
}

function ReportPanel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm sm:p-6">
      <div className="flex items-center gap-2 text-sky-400">
        <span>{icon}</span>
        <h2 className="text-sm sm:text-base font-bold text-white">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Bars({ items, color }: { items: { label: string; value: number }[]; color: string }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  if (items.length === 0) {
    return <p className="text-xs text-slate-500 py-3 text-center">No data for selected period.</p>;
  }

  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="grid grid-cols-[130px_1fr_32px] items-center gap-3 text-xs">
          <span className="truncate font-medium text-slate-300">{item.label}</span>
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div className={`h-full rounded-full ${color}`} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <span className="text-right font-bold text-slate-200">{item.value}</span>
        </div>
      ))}
    </div>
  );
}
