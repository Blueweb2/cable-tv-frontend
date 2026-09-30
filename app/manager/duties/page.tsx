"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ClipboardList,
  Radio,
  CheckSquare,
  Building2,
  IndianRupee,
  Plus,
  Loader2,
  AlertCircle,
  X,
  Wrench,
  Search,
} from "lucide-react";

import AddDutyModal, { type DutyFormValues } from "@/components/manager/duties/AddDutyModal";
import ManageChecklistModal from "@/components/manager/duties/ManageChecklistModal";
import DepartmentCapacityGrid from "@/components/manager/duties/DepartmentCapacityGrid";
import DutiesFilters from "@/components/manager/duties/DutiesFilters";
import DutiesHeader from "@/components/manager/duties/DutiesHeader";
import DutiesList from "@/components/manager/duties/DutiesList";
import DutiesStats from "@/components/manager/duties/DutiesStats";
import StaffHoursPayrollView from "@/components/manager/duties/StaffHoursPayrollView";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { type Duty, type DutyStatus } from "@/components/manager/duties/constants";
import { useAssignments } from "@/hooks/useAssignments";
import { useAuth } from "@/hooks/useAuth";
import { useStaff } from "@/hooks/useStaff";
import { getZones } from "@/lib/zone.api";
import { mapAssignmentToDuty } from "@/lib/duty-mapper";
import { getTasks, updateTask } from "@/lib/task.api";
import type { Task } from "@/types/task";
import type { Zone } from "@/types/zone";

type TabType = "list" | "tasks" | "departments" | "payroll";

function OperationsHubContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as TabType) || "list";

  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const { token } = useAuth();

  // Duties & Assignments State
  const {
    assignments,
    loading: assignmentsLoading,
    error: assignmentsError,
    addAssignment,
    editAssignment,
    removeAssignment,
    fetchAllAssignments,
    fetchAssignments,
  } = useAssignments({ token, autoFetch: false });
  
  const { staff, loading: staffLoading } = useStaff({ token });
  const [zones, setZones] = useState<Zone[]>([]);
  const [zonesError, setZonesError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | DutyStatus>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDuty, setEditingDuty] = useState<Duty | null>(null);
  const [deletingDuty, setDeletingDuty] = useState<Duty | null>(null);
  const [managingChecklistDuty, setManagingChecklistDuty] = useState<Duty | null>(null);

  // Tasks State
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<string>("ALL");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskActionError, setTaskActionError] = useState<string | null>(null);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as TabType;
    if (tabFromUrl && ["list", "tasks", "departments", "payroll"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    router.replace(`/manager/duties?tab=${tab}`);
  };

  useEffect(() => {
    if (!token) return;
    getZones(token, { limit: 100 })
      .then((result) => setZones(result.data))
      .catch((error) =>
        setZonesError(error instanceof Error ? error.message : "Failed to load network zones")
      );
  }, [token]);

  useEffect(() => {
    if (!token) return;
    void fetchAllAssignments();

    const interval = setInterval(() => {
      void fetchAllAssignments(undefined, { silent: true });
    }, 4000);

    return () => clearInterval(interval);
  }, [token, fetchAllAssignments]);

  useEffect(() => {
    if (!token || activeTab !== "tasks") return;
    setTasksLoading(true);
    getTasks(token, { limit: 100 })
      .then((res) => setTasks(res.data))
      .catch((err) => console.warn("Failed to load tasks", err))
      .finally(() => setTasksLoading(false));
  }, [token, activeTab]);

  // Mapped duties
  const duties = useMemo(
    () =>
      assignments
        .filter((assignment) => assignment.status !== "CANCELLED")
        .map(mapAssignmentToDuty),
    [assignments]
  );

  const filteredDuties = useMemo(() => {
    const query = search.trim().toLowerCase();
    return duties.filter(
      (duty) =>
        (!query ||
          [duty.title, duty.event, duty.staffName, duty.location].some((val) =>
            (val || "").toLowerCase().includes(query)
          )) &&
        (status === "All" || duty.status === status)
    );
  }, [duties, search, status]);

  // Roster CSV Exporter
  const handleExportRoster = () => {
    if (duties.length === 0) return;
    const headers = ["Work Order", "Zone / Node", "Technician", "Date", "Start Time", "End Time", "Status", "Location", "Checklist Count", "Completed"];
    const rows = filteredDuties.map((d) => [
      `"${d.title.replace(/"/g, '""')}"`,
      `"${(d.event || "").replace(/"/g, '""')}"`,
      `"${d.staffName.replace(/"/g, '""')}"`,
      `"${d.eventDate}"`,
      `"${d.startTime}"`,
      `"${d.endTime}"`,
      `"${d.status}"`,
      `"${(d.location || "").replace(/"/g, '""')}"`,
      d.checklist?.length || 0,
      d.checklist?.filter((c) => c.completed).length || 0,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cable_work_orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closeModal = () => {
    if (!assignmentsLoading) {
      setModalOpen(false);
      setEditingDuty(null);
    }
  };

  const handleSaveDuty = async (values: DutyFormValues) => {
    const payload = {
      zone: values.zone || undefined,
      zoneName: values.zoneName || undefined,
      nodeNumber: values.nodeNumber || undefined,
      staff: values.staff,
      dutyTitle: values.dutyTitle,
      jobType: values.jobType,
      priority: values.priority,
      description: values.description || undefined,
      location: values.location || undefined,
      subscriber: values.subscriber,
      dutyDate: values.dutyDate,
      startTime: values.startTime,
      endTime: values.endTime,
      hourlyRate: Number(values.hourlyRate) || 0,
      checklist: values.checklist || [],
    };
    if (editingDuty) await editAssignment(editingDuty.id, payload);
    else await addAssignment(payload as any);
    closeModal();
  };

  const handleToggleChecklist = async (
    dutyId: string,
    updatedChecklist: Array<{ _id?: string; text: string; completed: boolean }>
  ) => {
    await editAssignment(dutyId, { checklist: updatedChecklist });
  };

  const handleSaveChecklistModal = async (
    dutyId: string,
    updatedChecklist: Array<{ _id?: string; text: string; completed: boolean }>
  ) => {
    await editAssignment(dutyId, { checklist: updatedChecklist });
    await fetchAllAssignments();
  };

  const handleStatusChange = async (duty: Duty) => {
    const nextStatus: Partial<Record<DutyStatus, DutyStatus>> = {
      ASSIGNED: "IN_PROGRESS",
      ACCEPTED: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
    };
    const next = nextStatus[duty.status];
    if (next) await editAssignment(duty.id, { status: next });
  };

  const handleToggleTaskStatus = async (task: Task) => {
    if (!token) return;
    setTaskActionError(null);
    const statusFlow: Record<string, "PENDING" | "IN_PROGRESS" | "COMPLETED"> = {
      PENDING: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
      COMPLETED: "PENDING",
    };
    const nextStatus = statusFlow[task.status] || "PENDING";
    try {
      const updated = await updateTask(task._id, { status: nextStatus }, token);
      setTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
    } catch (err) {
      setTaskActionError(
        err instanceof Error ? err.message : "Failed to update task status"
      );
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesPriority = taskPriorityFilter === "ALL" || t.priority === taskPriorityFilter;
      const matchesSearch = !taskSearch.trim() || t.title.toLowerCase().includes(taskSearch.toLowerCase());
      return matchesPriority && matchesSearch;
    });
  }, [tasks, taskPriorityFilter, taskSearch]);

  const zoneOptions = zones.map((z) => ({
    id: z._id,
    name: z.name,
    code: z.code,
    coverageArea: z.coverageArea,
  }));

  const staffOptions = staff
    .filter((member) => member.isActive)
    .map((member) => ({ id: member.id, name: member.name, department: member.department }));
  
  const loading = assignmentsLoading || staffLoading;
  const error = assignmentsError || zonesError;

  const pendingPayrollCount = useMemo(
    () => duties.filter((d) => d.paymentStatus !== "PAID").length,
    [duties]
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & View Tabs */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="text-[#00d2ff]" size={20} />
            <p className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Operations Hub
            </p>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-white">
            Field Jobs & Work Orders
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Dispatch fiber technicians, assign node maintenance work orders, and manage field checklists.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex w-full overflow-x-auto rounded-2xl border border-slate-800 bg-[#0f172a] p-1.5 shadow-sm xl:w-auto">
          <div className="flex items-center gap-1 min-w-max">
            <button
              type="button"
              onClick={() => switchTab("list")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === "list"
                  ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ClipboardList size={15} className="shrink-0" />
              <span>1. Work Orders Roster</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("tasks")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === "tasks"
                  ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <CheckSquare size={15} className="shrink-0" />
              <span>2. Task Checklist</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("departments")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3 sm:px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === "departments"
                  ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Building2 size={15} className="shrink-0" />
              <span>3. Team Capabilities</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab("payroll")}
              className={`inline-flex items-center gap-1.5 shrink-0 rounded-xl px-3.5 sm:px-4 py-2 text-xs font-bold transition-all ${
                activeTab === "payroll"
                  ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-500/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <IndianRupee size={15} className="shrink-0 text-cyan-400" />
              <span>4. Technician Hours & Payouts</span>
              {pendingPayrollCount > 0 && (
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                    activeTab === "payroll"
                      ? "bg-white text-sky-900"
                      : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                  }`}
                >
                  {pendingPayrollCount} PENDING
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-400">
          {error}
        </p>
      )}

      {/* ========================================================
          TAB 1: WORK ORDERS LIST VIEW
      ======================================================== */}
      {activeTab === "list" && (
        <div className="space-y-6">
          <DutiesHeader
            onAddDuty={() => { setEditingDuty(null); setModalOpen(true); }}
            onExportRoster={handleExportRoster}
          />
          <DutiesStats duties={duties} />
          <DutiesFilters
            search={search}
            status={status}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onClear={() => { setSearch(""); setStatus("All"); }}
          />
          <DutiesList
            duties={filteredDuties}
            loading={loading}
            onEdit={(duty) => { setEditingDuty(duty); setModalOpen(true); }}
            onDelete={setDeletingDuty}
            onStatusChange={handleStatusChange}
            onToggleChecklist={handleToggleChecklist}
            onManageChecklist={setManagingChecklistDuty}
          />
        </div>
      )}

      {/* ========================================================
          TAB 2: TASK CHECKLIST VIEW
      ======================================================== */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Field Tasks Checklist</h2>
              <p className="text-xs text-slate-400">Track and check off real-time steps for fiber splicing, installs & node repairs.</p>
            </div>
          </div>

          {taskActionError && (
            <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-semibold text-rose-400">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-rose-400" />
                <span>{taskActionError}</span>
              </div>
              <button type="button" onClick={() => setTaskActionError(null)} className="text-rose-400 hover:text-white">
                <X size={15} />
              </button>
            </div>
          )}

          {/* Priority Filters & Search */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between rounded-xl border border-slate-800 bg-[#0f172a]/70 p-3.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Priority:</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {["ALL", "HIGH", "MEDIUM", "LOW"].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTaskPriorityFilter(p)}
                    className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      taskPriorityFilter === p
                        ? "bg-sky-600 text-white"
                        : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    }`}
                  >
                    {p === "ALL" ? "All Priorities" : p}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative w-full md:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                className="h-9 w-full rounded-xl border border-slate-700 bg-slate-900 pl-8 pr-3 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {tasksLoading ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/50 p-8 text-center text-xs text-slate-400">
              Loading field tasks...
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0f172a]/30 p-8 text-center">
              <CheckSquare className="mx-auto h-8 w-8 text-slate-600" />
              <p className="mt-2 text-sm font-semibold text-slate-300">No matching tasks found</p>
              <p className="mt-1 text-xs text-slate-500">Tasks are auto-generated from work orders and checklist items.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTasks.map((task) => (
                <div key={task._id} className="rounded-2xl border border-slate-800 bg-[#0f172a]/80 p-4 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm text-white leading-snug">{task.title}</h3>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold border border-sky-500/30 bg-sky-500/10 text-sky-400">
                        {task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="mt-2 text-xs text-slate-400 line-clamp-2">{task.description}</p>
                    )}
                  </div>

                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
                      <span>Due: {task.dueDate?.slice(0, 10) || "Today"}</span>
                      <span className="rounded-md px-2 py-0.5 text-[10px] bg-slate-800 text-slate-300">
                        {task.status.replace("_", " ")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleTaskStatus(task)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white text-center"
                    >
                      {task.status === "PENDING" && "Start Task (In Progress)"}
                      {task.status === "IN_PROGRESS" && "Mark Task as Completed ✓"}
                      {task.status === "COMPLETED" && "Reset Task to Pending"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: DEPARTMENT CAPACITY & ROSTER MATRIX
      ======================================================== */}
      {activeTab === "departments" && (
        <DepartmentCapacityGrid
          onSelectStaffForDuty={() => {
            setEditingDuty(null);
            setModalOpen(true);
          }}
        />
      )}

      {/* ========================================================
          TAB 4: STAFF WORKING HOURS & PAYROLL
      ======================================================== */}
      {activeTab === "payroll" && (
        <StaffHoursPayrollView
          duties={duties}
          token={token || ""}
          onRefresh={fetchAllAssignments}
          onManageChecklist={setManagingChecklistDuty}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(deletingDuty)}
        onClose={() => setDeletingDuty(null)}
        onConfirm={async () => {
          if (deletingDuty) {
            await removeAssignment(deletingDuty.id);
            setDeletingDuty(null);
          }
        }}
        title="Delete Work Order?"
        description={deletingDuty ? `Are you sure you want to delete "${deletingDuty.title}"?` : undefined}
        confirmText="Delete Work Order"
      />

      {modalOpen && (
        <AddDutyModal
          key={editingDuty?.id ?? "new"}
          open={modalOpen}
          onClose={closeModal}
          onSave={handleSaveDuty}
          editingDuty={editingDuty}
          zones={zoneOptions}
          staff={staffOptions}
          loading={loading}
        />
      )}

      {managingChecklistDuty && (
        <ManageChecklistModal
          key={managingChecklistDuty.id}
          isOpen={Boolean(managingChecklistDuty)}
          duty={managingChecklistDuty}
          onClose={() => setManagingChecklistDuty(null)}
          onSaveChecklist={handleSaveChecklistModal}
        />
      )}
    </div>
  );
}

export default function DutiesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-sky-400" />
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Loading Operations Hub...</p>
        </div>
      }
    >
      <OperationsHubContent />
    </Suspense>
  );
}
