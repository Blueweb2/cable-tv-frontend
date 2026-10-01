"use client";

import { useEffect, useState } from "react";
import {
  Radio,
  Plus,
  Search,
  Filter,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  Edit2,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getZones, createZone, updateZone, deleteZone } from "@/lib/zone.api";
import { getStaff } from "@/lib/staff.api";
import type { Zone, NodeItem } from "@/types/zone";
import type { Staff } from "@/types/staff";

interface ZoneFormData {
  name: string;
  code: string;
  zoneType: Zone["zoneType"];
  coverageArea: string;
  totalSubscribers: number;
  assignedLead: string;
  status: Zone["status"];
  nodes: NodeItem[];
}

export default function ManagerZonesPage() {
  const { token } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<Zone | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState<ZoneFormData>({
    name: "",
    code: "",
    zoneType: "FIBER_FTTH",
    coverageArea: "",
    totalSubscribers: 0,
    assignedLead: "",
    status: "OPERATIONAL",
    nodes: [
      {
        nodeNumber: "NODE-1",
        location: "Main Junction",
        opticalPowerDbm: "-18 dBm",
        status: "HEALTHY",
        amplifierCount: 2,
      },
    ],
  });

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [zonesRes, staffRes] = await Promise.all([
        getZones(token, { search, status: statusFilter }),
        getStaff(token),
      ]);
      setZones(zonesRes.data || []);
      setStaffList(staffRes.data || []);
    } catch (err: any) {
      setError(err.message || "Failed to load network zones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, search, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingZone(null);
    setFormData({
      name: "",
      code: `Z-SEC-${Math.floor(10 + Math.random() * 90)}`,
      zoneType: "FIBER_FTTH",
      coverageArea: "",
      totalSubscribers: 250,
      assignedLead: "",
      status: "OPERATIONAL",
      nodes: [
        {
          nodeNumber: "NODE-1",
          location: "Main Junction",
          opticalPowerDbm: "-18 dBm",
          status: "HEALTHY",
          amplifierCount: 2,
        },
      ],
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (zone: Zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      code: zone.code,
      zoneType: zone.zoneType,
      coverageArea: zone.coverageArea,
      totalSubscribers: zone.totalSubscribers || 0,
      assignedLead:
        typeof zone.assignedLead === "object" && zone.assignedLead
          ? zone.assignedLead._id
          : "",
      status: zone.status,
      nodes:
        zone.nodes && zone.nodes.length > 0
          ? zone.nodes
          : [
              {
                nodeNumber: "NODE-1",
                location: "Main Junction",
                opticalPowerDbm: "-18 dBm",
                status: "HEALTHY",
                amplifierCount: 2,
              },
            ],
    });
    setError("");
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (!formData.name || !formData.code || !formData.coverageArea) {
      setError("Please fill in Zone Name, Code, and Coverage Area");
      return;
    }

    try {
      setSaving(true);
      setError("");
      const payload: any = {
        name: formData.name,
        code: formData.code,
        zoneType: formData.zoneType,
        coverageArea: formData.coverageArea,
        totalSubscribers: Number(formData.totalSubscribers),
        assignedLead: formData.assignedLead || null,
        status: formData.status,
        nodes: formData.nodes,
      };

      if (editingZone) {
        await updateZone(token, editingZone._id, payload);
      } else {
        await createZone(token, payload);
      }

      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to save zone");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete this network zone?")) return;
    try {
      await deleteZone(token, id);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete zone");
    }
  };

  const addNodeRow = () => {
    const nextNum = (formData.nodes.length || 0) + 1;
    setFormData({
      ...formData,
      nodes: [
        ...formData.nodes,
        {
          nodeNumber: `NODE-${nextNum}`,
          location: "",
          opticalPowerDbm: "-19 dBm",
          status: "HEALTHY",
          amplifierCount: 2,
        },
      ],
    });
  };

  const removeNodeRow = (index: number) => {
    setFormData({
      ...formData,
      nodes: formData.nodes.filter((_, i) => i !== index),
    });
  };

  const updateNodeField = (index: number, field: string, value: any) => {
    const updated = [...formData.nodes];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, nodes: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="text-[#00d2ff]" size={24} />
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Cable Network Zones & Distribution Nodes
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Define service sectors, manage FTTH optical nodes, and assign lead technicians.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition hover:from-sky-500 hover:to-cyan-500 active:scale-95"
        >
          <Plus size={16} />
          Add New Zone
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-[#0f172a]/70 p-3">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search zones, codes, or coverage areas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:border-sky-500 focus:outline-none"
          >
            <option value="ALL">All Network Statuses</option>
            <option value="OPERATIONAL">Operational</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="DEGRADED">Degraded</option>
            <option value="OUTAGE">Outage</option>
          </select>
        </div>
      </div>

      {/* Zones Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          <div className="mx-auto mb-2 h-7 w-7 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
          Loading network coverage zones...
        </div>
      ) : zones.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/50 py-12 text-center text-xs text-slate-400">
          <Radio size={32} className="mx-auto mb-3 text-slate-600" />
          <p className="text-sm font-semibold text-slate-300">No network zones found</p>
          <p className="mt-1 text-slate-500">Create your first cable service zone to assign technicians.</p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <Plus size={14} /> Add Zone
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {zones.map((zone) => {
            const leadName =
              typeof zone.assignedLead === "object" && zone.assignedLead
                ? zone.assignedLead.name
                : "No Lead Assigned";
            const leadPhone =
              typeof zone.assignedLead === "object" && zone.assignedLead
                ? zone.assignedLead.phone
                : "";

            return (
              <div
                key={zone._id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0f172a]/80 p-5 transition hover:border-slate-700 shadow-xl"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400 border border-sky-500/20">
                          {zone.code}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                          {zone.zoneType.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-base font-bold text-white">
                        {zone.name}
                      </h3>
                    </div>

                    <span
                      className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        zone.status === "OPERATIONAL"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : zone.status === "MAINTENANCE"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {zone.status}
                    </span>
                  </div>

                  <p className="mt-2 text-xs text-slate-400 line-clamp-2">
                    {zone.coverageArea}
                  </p>

                  {/* Telemetry Stats */}
                  <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-900/80 p-3 border border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Subscribers</span>
                      <p className="font-bold text-white">{zone.totalSubscribers || 0}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500">Active Nodes</span>
                      <p className="font-bold text-[#00d2ff]">{zone.nodes?.length || 0} Nodes</p>
                    </div>
                    <div className="col-span-2 pt-1 border-t border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500">Lead Technician</span>
                      <p className="font-semibold text-slate-200 truncate">
                        {leadName} {leadPhone ? `(${leadPhone})` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Nodes List */}
                  {zone.nodes && zone.nodes.length > 0 && (
                    <div className="mt-3 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Node Signals
                      </span>
                      <div className="space-y-1">
                        {zone.nodes.slice(0, 3).map((node, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between rounded-lg bg-slate-800/40 px-2.5 py-1 text-[11px]"
                          >
                            <span className="font-semibold text-slate-300">
                              {node.nodeNumber}
                            </span>
                            <span className="text-slate-400 truncate max-w-[120px]">
                              {node.location || "Pillar junction"}
                            </span>
                            <span className="font-mono text-cyan-400">
                              {node.opticalPowerDbm || "-18 dBm"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-[10px] text-slate-500">
                    {zone.activeDutiesCount ? `${zone.activeDutiesCount} active jobs` : "No pending jobs"}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(zone)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                      title="Edit Zone"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(zone._id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-950/40 hover:text-rose-400"
                      title="Delete Zone"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Zone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Radio size={18} className="text-[#00d2ff]" />
                {editingZone ? "Edit Network Zone" : "Create New Network Zone"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300">Zone Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Sector Ring A"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300">Zone Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Z-NORTH-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono uppercase focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Zone Type</label>
                  <select
                    value={formData.zoneType}
                    onChange={(e) => setFormData({ ...formData, zoneType: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="FIBER_FTTH">Fiber FTTH</option>
                    <option value="COAXIAL_GRID">Coaxial Grid</option>
                    <option value="HYBRID_HFC">Hybrid HFC</option>
                    <option value="COMMERCIAL_HUB">Commercial Hub</option>
                    <option value="RESIDENTIAL_SECTOR">Residential Sector</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Network Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="OPERATIONAL">Operational</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="DEGRADED">Degraded</option>
                    <option value="OUTAGE">Outage</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Coverage Area *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Sector 4, 5, Metro Corridor and Green Park Avenue"
                  value={formData.coverageArea}
                  onChange={(e) => setFormData({ ...formData, coverageArea: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Subscribers Count</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.totalSubscribers}
                    onChange={(e) => setFormData({ ...formData, totalSubscribers: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Assign Lead Technician</label>
                  <select
                    value={formData.assignedLead}
                    onChange={(e) => setFormData({ ...formData, assignedLead: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="">-- Select Technician --</option>
                    {staffList.map((staff) => (
                      <option key={staff.id || (staff as any)._id} value={staff.id || (staff as any)._id}>
                        {staff.name} ({staff.department || "Technician"})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Node Items Management */}
              <div className="border-t border-slate-800 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200">
                    Distribution Nodes & Power Levels
                  </label>
                  <button
                    type="button"
                    onClick={addNodeRow}
                    className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Node
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {formData.nodes.map((node, i) => (
                    <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-900 p-2 border border-slate-800 text-xs">
                      <input
                        type="text"
                        placeholder="Node #"
                        value={node.nodeNumber}
                        onChange={(e) => updateNodeField(i, "nodeNumber", e.target.value)}
                        className="w-24 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Location"
                        value={node.location || ""}
                        onChange={(e) => updateNodeField(i, "location", e.target.value)}
                        className="flex-1 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-white"
                      />
                      <input
                        type="text"
                        placeholder="dBm (e.g. -18 dBm)"
                        value={node.opticalPowerDbm || ""}
                        onChange={(e) => updateNodeField(i, "opticalPowerDbm", e.target.value)}
                        className="w-24 rounded border border-slate-700 bg-slate-800 px-2 py-1 text-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => removeNodeRow(i)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-500 hover:to-cyan-500 disabled:opacity-50"
                >
                  {saving ? "Saving..." : editingZone ? "Update Zone" : "Create Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
