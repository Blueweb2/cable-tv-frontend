"use client";

import { useEffect, useState } from "react";
import {
  Save,
  X,
  AlertTriangle,
  Radio,
  Plus,
  Trash2,
  ListChecks,
  Wrench,
  MapPin,
  FileText,
  Zap,
  Users,
  CheckCircle2,
} from "lucide-react";
import type { Duty } from "./constants";
import { useAuth } from "@/hooks/useAuth";
import {
  getStaffRecommendations,
  type StaffRecommendation,
} from "@/lib/department.api";

export type DutyFormValues = {
  zone?: string;
  zoneName?: string;
  nodeNumber?: string;
  staff: string;
  assignedStaff?: string[];
  specializationRequired?: string;
  dutyTitle: string;
  jobType?: string;
  priority?: string;
  description: string;
  location?: string;
  siteLocation?: {
    address?: string;
    landmark?: string;
    poleNumber?: string;
    distributionBox?: string;
    googleMapsUrl?: string;
    coordinates?: {
      lat?: number | null;
      lng?: number | null;
    };
  };
  problemDetails?: {
    issueCategory?: string;
    faultDescription?: string;
    affectedSubscribersCount?: number;
    reportedBy?: string;
    reportedPhone?: string;
    initialOpticalPowerDbm?: string;
  };
  subscriber?: {
    name?: string;
    phone?: string;
    accountNo?: string;
    address?: string;
  };
  dutyDate: string;
  startTime: string;
  endTime: string;
  hourlyRate?: number;
  checklist?: Array<{ _id?: string; text: string; completed: boolean }>;
};

type ZoneOption = { id: string; name: string; code: string; coverageArea?: string };
type StaffOption = { id: string; name: string; department?: string };

interface AddDutyModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (values: DutyFormValues) => Promise<void>;
  editingDuty?: Duty | null;
  zones?: ZoneOption[];
  staff: StaffOption[];
  loading?: boolean;
  events?: any[];
}

const CHECKLIST_PRESETS: Record<string, string[]> = {
  FIBER_SPLICING: [
    "Safety cones & OTDR test set up",
    "Locate damaged core in optical distribution frame",
    "Precision fiber cleaving & fusion splice",
    "Heat shrink sleeve protection & tray routing",
    "Optical power verification (target < -18 dBm)",
  ],
  NEW_INSTALLATION: [
    "Drop cable routing from distribution pole to premises",
    "Install fiber termination box & SC-APC connector",
    "Configure Dual-Band ONT / Wi-Fi Router & HD STB",
    "Verify channel lineup & speed test (> 100 Mbps)",
    "Subscriber sign-off & app account demonstration",
  ],
  NODE_MAINTENANCE: [
    "Inspect 60V AC power supply & power inserter",
    "Test optical receiver input light level",
    "Adjust forward & reverse gain/slope RF potentiometers",
    "Replace faulty line extender amplifier if needed",
    "Record signal levels across pilot frequencies",
  ],
  LINE_REPAIR: [
    "Locate coaxial line fault / RF leakage area",
    "Replace damaged RG-6/RG-11 trunk cable segment",
    "Re-crimp weather-sealed F-connectors & tap port",
    "Verify subscriber TV signal strength (target 60-70 dBuV)",
  ],
};

export default function AddDutyModal({
  open,
  onClose,
  onSave,
  editingDuty,
  zones = [],
  staff,
  loading = false,
}: AddDutyModalProps) {
  const [form, setForm] = useState<DutyFormValues>(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (editingDuty) {
      return {
        zone: (editingDuty as any).zoneId || "",
        zoneName: (editingDuty as any).zoneName || "",
        nodeNumber: (editingDuty as any).nodeNumber || "",
        staff: editingDuty.staffId,
        dutyTitle: editingDuty.title,
        jobType: (editingDuty as any).jobType || "FIBER_SPLICING",
        priority: (editingDuty as any).priority || "MEDIUM",
        description: editingDuty.description,
        location: editingDuty.location || "",
        siteLocation: (editingDuty as any).siteLocation || {
          address: editingDuty.location || "",
          landmark: "",
          poleNumber: "",
          distributionBox: "",
          googleMapsUrl: "",
        },
        problemDetails: (editingDuty as any).problemDetails || {
          issueCategory: "Fiber Cut / Attenuation",
          faultDescription: editingDuty.description || "",
          affectedSubscribersCount: 1,
          reportedBy: "NOC Dispatcher",
          reportedPhone: "",
          initialOpticalPowerDbm: "-24.5 dBm",
        },
        subscriber: (editingDuty as any).subscriber || { name: "", phone: "", accountNo: "", address: "" },
        dutyDate: editingDuty.eventDate || todayStr,
        startTime: editingDuty.startTime || "09:00",
        endTime: editingDuty.endTime || "13:00",
        hourlyRate: editingDuty.hourlyRate || 150,
        checklist: editingDuty.checklist || [],
      };
    }
    return {
      zone: zones[0]?.id || "",
      zoneName: zones[0]?.name || "",
      nodeNumber: "NODE-1",
      staff: staff[0]?.id || "",
      dutyTitle: "Fiber Core Splicing & Optical Power Calibration",
      jobType: "FIBER_SPLICING",
      priority: "HIGH",
      description: "",
      location: "",
      siteLocation: {
        address: "Sector 4 Main Junction, Near Metro Pillar 14",
        landmark: "Opposite Gate 2 Substation",
        poleNumber: "POLE-44B",
        distributionBox: "FAT-04",
        googleMapsUrl: "https://www.google.com/maps?q=28.6139,77.2090",
      },
      problemDetails: {
        issueCategory: "Optical Power Degradation",
        faultDescription: "High attenuation (-26 dBm) detected on Core #4. Need OTDR pinpointing and splice replacement.",
        affectedSubscribersCount: 35,
        reportedBy: "NOC Monitoring System",
        reportedPhone: "+91 98765 00000",
        initialOpticalPowerDbm: "-26.2 dBm",
      },
      subscriber: { name: "", phone: "", accountNo: "", address: "" },
      dutyDate: todayStr,
      startTime: "09:00",
      endTime: "13:00",
      hourlyRate: 150,
      checklist: CHECKLIST_PRESETS.FIBER_SPLICING.map((text) => ({ text, completed: false })),
    };
  });

  const { token } = useAuth();
  const [recommendations, setRecommendations] = useState<StaffRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    if (!token || !open) return;
    setLoadingRecs(true);
    getStaffRecommendations(
      {
        jobType: form.jobType,
        zone: form.zone,
        date: form.dutyDate,
      },
      token
    )
      .then((res) => {
        if (res.data) setRecommendations(res.data);
      })
      .catch((err) => console.warn("Failed to load staff recommendations:", err))
      .finally(() => setLoadingRecs(false));
  }, [token, open, form.jobType, form.zone, form.dutyDate]);

  const [newCheckitem, setNewCheckitem] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "location" | "problem" | "checklist">("general");
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (jobTypeKey: string) => {
    const preset = CHECKLIST_PRESETS[jobTypeKey];
    if (preset) {
      setForm((prev) => ({
        ...prev,
        jobType: jobTypeKey,
        checklist: preset.map((text) => ({ text, completed: false })),
      }));
    }
  };

  const handleAddCheckitem = () => {
    if (!newCheckitem.trim()) return;
    setForm((prev) => ({
      ...prev,
      checklist: [...(prev.checklist || []), { text: newCheckitem.trim(), completed: false }],
    }));
    setNewCheckitem("");
  };

  const handleRemoveCheckitem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      checklist: (prev.checklist || []).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.staff || !form.dutyTitle || !form.dutyDate || !form.startTime || !form.endTime) {
      setError("Please fill in Technician, Duty Title, Date, and Shift Times");
      return;
    }

    try {
      setError(null);
      await onSave(form);
    } catch (err: any) {
      setError(err.message || "Failed to create work order");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-700 bg-[#0f172a] p-6 shadow-2xl my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench size={18} className="text-[#00d2ff]" />
              {editingDuty ? "Edit Field Work Order" : "Dispatch Field Work Order"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Specify site location, GPS coordinates, problem diagnostic, and assign technician
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-800 pt-3 pb-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("general")}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === "general"
                ? "bg-sky-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            1. Duty & Technician
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("location")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "location"
                ? "bg-sky-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <MapPin size={13} />
            2. Site Location & GPS
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("problem")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "problem"
                ? "bg-sky-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <AlertTriangle size={13} />
            3. Problem Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("checklist")}
            className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === "checklist"
                ? "bg-sky-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ListChecks size={13} />
            4. Steps Checklist
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-400 flex items-center gap-2">
            <AlertTriangle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* TAB 1: GENERAL */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300">Work Order Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Node 4 Amplifier Replacement"
                    value={form.dutyTitle}
                    onChange={(e) => setForm({ ...form, dutyTitle: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-300">Job Category *</label>
                  <select
                    value={form.jobType}
                    onChange={(e) => {
                      setForm({ ...form, jobType: e.target.value });
                      applyPreset(e.target.value);
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="FIBER_SPLICING">Fiber Splicing & OTDR Calibration</option>
                    <option value="LINE_REPAIR">Coaxial Line Repair & Drop Wire</option>
                    <option value="NEW_INSTALLATION">New FTTH & STB Setup</option>
                    <option value="NODE_MAINTENANCE">Node & Amplifier Maintenance</option>
                    <option value="SIGNAL_OPTIMIZATION">Signal Level Optimization</option>
                    <option value="PAYMENT_COLLECTION">Payment Collection Run</option>
                    <option value="GENERAL_SHIFT">General Field Duty Shift</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Priority Level</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL_OUTAGE">CRITICAL OUTAGE 🚨</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Network Zone</label>
                  <select
                    value={form.zone}
                    onChange={(e) => {
                      const z = zones.find((item) => item.id === e.target.value);
                      setForm({ ...form, zone: e.target.value, zoneName: z?.name || "" });
                    }}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="">-- General / No Zone --</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} ({z.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Node / Pillar #</label>
                  <input
                    type="text"
                    placeholder="e.g. NODE-N2 / Pillar 14"
                    value={form.nodeNumber}
                    onChange={(e) => setForm({ ...form, nodeNumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Recommended Technicians Section */}
              {recommendations.length > 0 && (
                <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Zap size={14} className="text-amber-400" />
                      Recommended Technicians ({form.jobType?.replace(/_/g, " ") || "Field Duty"})
                    </span>
                    {loadingRecs && <span className="text-[10px] text-slate-400 animate-pulse">Scoring staff...</span>}
                  </div>

                  <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {recommendations.slice(0, 4).map((rec) => {
                      const recId = rec.id || rec._id;
                      const isSelected = form.staff === recId;
                      return (
                        <button
                          key={recId}
                          type="button"
                          onClick={() => setForm((prev) => ({ ...prev, staff: recId }))}
                          className={`text-left p-2.5 rounded-lg border transition text-xs ${
                            isSelected
                              ? "border-sky-400 bg-sky-900/50 text-white shadow-sm ring-1 ring-sky-400"
                              : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/80"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              {rec.name}
                              {isSelected && <CheckCircle2 size={13} className="text-sky-400" />}
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              {rec.matchScore > 0 ? `+${rec.matchScore} pts` : `${rec.matchScore} pts`}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="text-cyan-300 font-medium">{rec.specialization || "Technician"}</span>
                            <span>•</span>
                            <span className={rec.activeDutiesCount === 0 ? "text-emerald-400" : "text-amber-300"}>
                              {rec.activeDutiesCount} active today
                            </span>
                          </div>
                          {rec.matchReasons && rec.matchReasons.length > 0 && (
                            <div className="mt-1 text-[10px] text-slate-400 truncate">
                              ✓ {rec.matchReasons.slice(0, 2).join(" • ")}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Lead Technician *</label>
                  <select
                    required
                    value={form.staff}
                    onChange={(e) => setForm({ ...form, staff: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    <option value="">-- Select Field Technician --</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.department || "Field Staff"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Hourly Rate (₹/hr)</label>
                  <input
                    type="number"
                    min="0"
                    value={form.hourlyRate}
                    onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Shift Date *</label>
                  <input
                    type="date"
                    required
                    value={form.dutyDate}
                    onChange={(e) => setForm({ ...form, dutyDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">End Time *</label>
                  <input
                    type="time"
                    required
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SITE LOCATION & GPS */}
          {activeTab === "location" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">Site Address / Street Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Sector 4 Main Cross near Metro Pillar 14"
                  value={form.siteLocation?.address || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      location: e.target.value,
                      siteLocation: { ...form.siteLocation, address: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Pole / Tower Number</label>
                  <input
                    type="text"
                    placeholder="e.g. POLE-44B / Junction 3"
                    value={form.siteLocation?.poleNumber || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        siteLocation: { ...form.siteLocation, poleNumber: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Distribution / FAT Box #</label>
                  <input
                    type="text"
                    placeholder="e.g. FAT-04 Splitter"
                    value={form.siteLocation?.distributionBox || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        siteLocation: { ...form.siteLocation, distributionBox: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Nearby Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Opposite Gate 2 Electric Substation"
                    value={form.siteLocation?.landmark || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        siteLocation: { ...form.siteLocation, landmark: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Google Maps Navigation Link / Coords</label>
                  <input
                    type="text"
                    placeholder="e.g. https://maps.google.com/?q=28.6139,77.2090"
                    value={form.siteLocation?.googleMapsUrl || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        siteLocation: { ...form.siteLocation, googleMapsUrl: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subscriber Details if Applicable */}
              <div className="border-t border-slate-800 pt-3">
                <label className="block text-xs font-bold text-sky-400 mb-2">Subscriber Info (If Home Complaint / Install)</label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Subscriber Name"
                    value={form.subscriber?.name || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subscriber: { ...form.subscriber, name: e.target.value },
                      })
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Contact Phone"
                    value={form.subscriber?.phone || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subscriber: { ...form.subscriber, phone: e.target.value },
                      })
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="Account / STB ID"
                    value={form.subscriber?.accountNo || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subscriber: { ...form.subscriber, accountNo: e.target.value },
                      })
                    }
                    className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROBLEM DETAILS */}
          {activeTab === "problem" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Fault Issue Category</label>
                  <input
                    type="text"
                    placeholder="e.g. Optical Signal Attenuation / Fiber Cut"
                    value={form.problemDetails?.issueCategory || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        problemDetails: { ...form.problemDetails, issueCategory: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Initial Optical Power (dBm)</label>
                  <input
                    type="text"
                    placeholder="e.g. -26.5 dBm (Warning Level)"
                    value={form.problemDetails?.initialOpticalPowerDbm || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        problemDetails: { ...form.problemDetails, initialOpticalPowerDbm: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white font-mono focus:border-sky-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">Detailed Fault Description / Diagnostic Symptoms *</label>
                <textarea
                  rows={3}
                  placeholder="Describe root cause, pole break location, subscriber complaint details, or specific cable color codes to splice..."
                  value={form.problemDetails?.faultDescription || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                      problemDetails: { ...form.problemDetails, faultDescription: e.target.value },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">Impacted Subscribers</label>
                  <input
                    type="number"
                    min="1"
                    value={form.problemDetails?.affectedSubscribersCount || 1}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        problemDetails: { ...form.problemDetails, affectedSubscribersCount: Number(e.target.value) },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Reported By</label>
                  <input
                    type="text"
                    placeholder="e.g. NOC Monitoring / Helpdesk"
                    value={form.problemDetails?.reportedBy || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        problemDetails: { ...form.problemDetails, reportedBy: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">Report Contact #</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98100 00000"
                    value={form.problemDetails?.reportedPhone || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        problemDetails: { ...form.problemDetails, reportedPhone: e.target.value },
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST */}
          {activeTab === "checklist" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">
                  Step-by-step Field Action Checklist
                </label>
                <button
                  type="button"
                  onClick={() => applyPreset(form.jobType || "FIBER_SPLICING")}
                  className="text-[10px] font-semibold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20"
                >
                  Load Category Preset
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {(form.checklist || []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 rounded-lg bg-slate-900 px-3 py-1.5 border border-slate-800 text-xs">
                    <span className="text-slate-300">{item.text}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCheckitem(i)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Add custom field step..."
                  value={newCheckitem}
                  onChange={(e) => setNewCheckitem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCheckitem();
                    }
                  }}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCheckitem}
                  className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:bg-slate-700 hover:text-white"
                >
                  Add Step
                </button>
              </div>
            </div>
          )}

          {/* Submit footer */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/25 hover:from-sky-500 hover:to-cyan-500 disabled:opacity-50"
            >
              <Save size={14} />
              {loading ? "Dispatching..." : editingDuty ? "Save Changes" : "Dispatch Work Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
