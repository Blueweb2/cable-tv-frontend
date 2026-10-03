"use client";

import { useEffect, useState } from "react";
import {
  Package,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Boxes,
  Loader2,
  Plus,
} from "lucide-react";
import { MaterialRequest } from "@/types";
import { inventoryApi } from "@/lib/inventory.api";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function StaffInventoryPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await inventoryApi.getMaterialRequests({ limit: 100 });
      setRequests(res.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load material requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Package className="h-7 w-7 text-indigo-400" />
            My Material & Hardware Requests
          </h1>
          <p className="text-sm text-slate-400">
            Track optical fiber, drop cables, connectors, ONUs and hardware issued for your field duties
          </p>
        </div>

        <Link
          href="/staff/duties"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition"
        >
          <Boxes className="h-4 w-4" />
          Go to My Duties
        </Link>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading your material requests...
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <Boxes className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-3 text-base font-semibold text-white">No Material Requests Found</h3>
          <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
            You can request fiber cables, splice sleeves, and equipment directly from any of your assigned field duties.
          </p>
          <Link
            href="/staff/duties"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            View Assigned Duties
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const duty = typeof req.duty === "object" ? req.duty : null;
            const zone = typeof req.zone === "object" ? req.zone : null;

            return (
              <div
                key={req._id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-semibold text-white text-base">
                        {duty ? duty.dutyTitle : "Work Order"}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
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
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                      <span>Zone: <strong className="text-slate-200">{zone?.name || "Main Hub"}</strong></span>
                      <span>•</span>
                      <span>Date: {new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link
                    href="/staff/duties"
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium underline"
                  >
                    Open Duty Details →
                  </Link>
                </div>

                {/* Items List */}
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full text-xs text-left">
                    <thead className="text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="py-1.5">Material</th>
                        <th className="py-1.5 text-center">Requested</th>
                        <th className="py-1.5 text-center">Approved</th>
                        <th className="py-1.5 text-center">Issued</th>
                        <th className="py-1.5 text-center">Used (Field)</th>
                        <th className="py-1.5 text-center">Returned</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/40 text-slate-300">
                      {req.items.map((item, idx) => {
                        const mat = typeof item.material === "object" ? item.material : null;
                        const matName = mat ? mat.name : "Material Item";
                        const unit = mat ? mat.unit : "units";

                        return (
                          <tr key={idx} className="hover:bg-slate-800/20">
                            <td className="py-2 font-medium text-white">
                              {matName} <span className="font-mono text-slate-400">({mat?.code})</span>
                            </td>
                            <td className="py-2 text-center text-slate-300 font-semibold">
                              {item.requestedQuantity} {unit}
                            </td>
                            <td className="py-2 text-center text-cyan-400 font-semibold">
                              {item.approvedQuantity || 0} {unit}
                            </td>
                            <td className="py-2 text-center text-indigo-400 font-semibold">
                              {item.issuedQuantity || 0} {unit}
                            </td>
                            <td className="py-2 text-center text-amber-400 font-semibold">
                              {item.usedQuantity || 0} {unit}
                            </td>
                            <td className="py-2 text-center text-emerald-400 font-semibold">
                              {item.returnedQuantity || 0} {unit}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
