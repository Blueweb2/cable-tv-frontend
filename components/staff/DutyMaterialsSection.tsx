"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Plus,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RotateCcw,
  Boxes,
  Loader2,
  X,
} from "lucide-react";
import {
  Material,
  MaterialRequest,
  CreateMaterialRequestPayload,
  MaterialConsumptionPayload,
} from "@/types";
import { inventoryApi } from "@/lib/inventory.api";

interface DutyMaterialsSectionProps {
  dutyId: string;
  dutyTitle?: string;
  isCompleted?: boolean;
}

export default function DutyMaterialsSection({
  dutyId,
  dutyTitle,
  isCompleted = false,
}: DutyMaterialsSectionProps) {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [availableMaterials, setAvailableMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal states
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isConsumptionModalOpen, setIsConsumptionModalOpen] = useState(false);
  const [activeRequestForConsumption, setActiveRequestForConsumption] = useState<MaterialRequest | null>(null);

  // Request form state
  const [requestItems, setRequestItems] = useState<
    Array<{ materialId: string; requestedQuantity: number }>
  >([{ materialId: "", requestedQuantity: 1 }]);
  const [requestNotes, setRequestNotes] = useState("");

  // Consumption form state
  const [consumptionInputs, setConsumptionInputs] = useState<
    Record<string, { used: number; returned: number }>
  >({});

  const loadDutyMaterials = async () => {
    try {
      setLoading(true);
      setError("");
      const [reqsRes, matsRes] = await Promise.all([
        inventoryApi.getMaterialRequests({ duty: dutyId }),
        inventoryApi.getMaterials({ isActive: true, limit: 100 }),
      ]);

      setRequests(reqsRes.data || []);
      setAvailableMaterials(matsRes.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load duty materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dutyId) {
      loadDutyMaterials();
    }
  }, [dutyId]);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Submit Request
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = requestItems.filter((it) => it.materialId && it.requestedQuantity > 0);
    if (validItems.length === 0) {
      setError("Please select at least one material and quantity.");
      return;
    }

    try {
      await inventoryApi.createMaterialRequest({
        dutyId,
        items: validItems,
        requestNotes,
      });

      showSuccess("Material request submitted to manager.");
      setIsRequestModalOpen(false);
      setRequestItems([{ materialId: "", requestedQuantity: 1 }]);
      setRequestNotes("");
      loadDutyMaterials();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    }
  };

  // Open Consumption Modal
  const handleOpenConsumption = (req: MaterialRequest) => {
    setActiveRequestForConsumption(req);
    const initialInputs: Record<string, { used: number; returned: number }> = {};
    req.items.forEach((item) => {
      const matId = typeof item.material === "object" ? item.material._id : item.material;
      initialInputs[matId] = {
        used: item.usedQuantity || item.issuedQuantity || 0,
        returned: item.returnedQuantity || 0,
      };
    });
    setConsumptionInputs(initialInputs);
    setIsConsumptionModalOpen(true);
  };

  // Submit Consumption & Return
  const handleSubmitConsumption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRequestForConsumption) return;

    try {
      const itemsPayload = Object.entries(consumptionInputs).map(([matId, vals]) => ({
        materialId: matId,
        usedQuantity: Number(vals.used) || 0,
        returnedQuantity: Number(vals.returned) || 0,
      }));

      await inventoryApi.recordMaterialConsumption(activeRequestForConsumption._id, {
        items: itemsPayload,
      });

      showSuccess("Material consumption and returns logged successfully.");
      setIsConsumptionModalOpen(false);
      setActiveRequestForConsumption(null);
      loadDutyMaterials();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record consumption");
    }
  };

  // Cancel Request
  const handleCancelRequest = async (reqId: string) => {
    try {
      await inventoryApi.cancelMaterialRequest(reqId);
      showSuccess("Material request cancelled.");
      loadDutyMaterials();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to cancel request");
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Boxes className="h-4 w-4 text-indigo-400" />
            Duty Materials & Spares
          </h3>
          <p className="text-xs text-slate-400">
            Request fiber, cables, ONUs and record actual usage and returns for this work order
          </p>
        </div>

        {!isCompleted && (
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            Request Materials
          </button>
        )}
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="hover:underline">Dismiss</button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="hover:underline">Dismiss</button>
        </div>
      )}

      {/* Material Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-6 text-slate-400 text-xs">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading duty materials...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-slate-800/60 bg-slate-950/40 p-4 text-center text-xs text-slate-500">
          No materials requested for this duty yet. Click &quot;Request Materials&quot; if cables or hardware are required.
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req._id}
              className="rounded-lg border border-slate-800 bg-slate-950/50 p-3.5 space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      req.status === "PENDING"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : req.status === "APPROVED"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                        : req.status === "ISSUED"
                        ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                        : req.status === "COMPLETED"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {req.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {req.status === "PENDING" && (
                    <button
                      onClick={() => handleCancelRequest(req._id)}
                      className="text-xs text-rose-400 hover:text-rose-300 underline"
                    >
                      Cancel Request
                    </button>
                  )}
                  {req.status === "ISSUED" && (
                    <button
                      onClick={() => handleOpenConsumption(req)}
                      className="inline-flex items-center gap-1 rounded bg-indigo-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Record Usage & Returns
                    </button>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left">
                  <thead className="text-slate-400 font-medium">
                    <tr>
                      <th className="py-1">Material</th>
                      <th className="py-1 text-center">Req.</th>
                      <th className="py-1 text-center">Appr.</th>
                      <th className="py-1 text-center">Issued</th>
                      <th className="py-1 text-center">Used</th>
                      <th className="py-1 text-center">Returned</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-slate-300">
                    {req.items.map((item, idx) => {
                      const mat = typeof item.material === "object" ? item.material : null;
                      const matName = mat ? mat.name : "Material Item";
                      const unit = mat ? mat.unit : "units";

                      return (
                        <tr key={idx}>
                          <td className="py-1.5 font-medium text-white">
                            {matName} <span className="font-mono text-slate-400">({mat?.code})</span>
                          </td>
                          <td className="py-1.5 text-center text-slate-300">
                            {item.requestedQuantity} {unit}
                          </td>
                          <td className="py-1.5 text-center text-cyan-400">
                            {item.approvedQuantity || 0} {unit}
                          </td>
                          <td className="py-1.5 text-center text-indigo-400 font-semibold">
                            {item.issuedQuantity || 0} {unit}
                          </td>
                          <td className="py-1.5 text-center text-amber-400 font-semibold">
                            {item.usedQuantity || 0} {unit}
                          </td>
                          <td className="py-1.5 text-center text-emerald-400 font-semibold">
                            {item.returnedQuantity || 0} {unit}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: REQUEST MATERIALS */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-indigo-400" />
                Request Materials for Work Order
              </h2>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="space-y-2.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Select Required Materials & Quantities
                </label>
                {requestItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <select
                      required
                      value={item.materialId}
                      onChange={(e) => {
                        const newItems = [...requestItems];
                        newItems[idx].materialId = e.target.value;
                        setRequestItems(newItems);
                      }}
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    >
                      <option value="">-- Choose Material --</option>
                      {availableMaterials.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.code}) [{m.unit}]
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min="0.1"
                      step="any"
                      required
                      value={item.requestedQuantity}
                      onChange={(e) => {
                        const newItems = [...requestItems];
                        newItems[idx].requestedQuantity = Number(e.target.value);
                        setRequestItems(newItems);
                      }}
                      placeholder="Qty"
                      className="w-24 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />

                    {requestItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          setRequestItems(requestItems.filter((_, i) => i !== idx));
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setRequestItems([...requestItems, { materialId: "", requestedQuantity: 1 }])
                  }
                  className="inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add another item
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Technician Notes / Work Justification
                </label>
                <textarea
                  rows={2}
                  value={requestNotes}
                  onChange={(e) => setRequestNotes(e.target.value)}
                  placeholder="e.g. 100m drop cable required for customer rooftop routing..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONSUMPTION & RETURNS */}
      {isConsumptionModalOpen && activeRequestForConsumption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-indigo-400" />
                Log Material Usage & Returns
              </h2>
              <button
                onClick={() => setIsConsumptionModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitConsumption} className="space-y-4">
              <div className="space-y-3">
                {activeRequestForConsumption.items.map((item, idx) => {
                  const mat = typeof item.material === "object" ? item.material : null;
                  const matId = mat ? mat._id : (item.material as string);
                  const matName = mat ? mat.name : "Material";
                  const unit = mat ? mat.unit : "units";
                  const issued = item.issuedQuantity || 0;

                  const currentInputs = consumptionInputs[matId] || { used: issued, returned: 0 };

                  return (
                    <div
                      key={idx}
                      className="rounded-lg border border-slate-800 bg-slate-800/40 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">{matName}</span>
                        <span className="text-[11px] text-indigo-300 font-mono">
                          Issued: {issued} {unit}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            Actually Used (Installed)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={issued}
                            step="any"
                            value={currentInputs.used}
                            onChange={(e) => {
                              const usedVal = Number(e.target.value);
                              const maxRet = Math.max(0, issued - usedVal);
                              setConsumptionInputs({
                                ...consumptionInputs,
                                [matId]: {
                                  used: usedVal,
                                  returned: Math.min(currentInputs.returned, maxRet),
                                },
                              });
                            }}
                            className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-0.5">
                            Unused (To Return)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={Math.max(0, issued - currentInputs.used)}
                            step="any"
                            value={currentInputs.returned}
                            onChange={(e) =>
                              setConsumptionInputs({
                                ...consumptionInputs,
                                [matId]: {
                                  ...currentInputs,
                                  returned: Number(e.target.value),
                                },
                              })
                            }
                            className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        * Returned materials automatically increment warehouse store stock upon submission.
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConsumptionModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Save Consumption & Returns
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
