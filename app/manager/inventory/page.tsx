"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Package,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  FileText,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Send,
  Boxes,
} from "lucide-react";
import {
  Material,
  StockTransaction,
  MaterialRequest,
  InventorySummary,
  CreateMaterialPayload,
  StockTransactionPayload,
  ApproveMaterialRequestPayload,
} from "@/types";
import { inventoryApi } from "@/lib/inventory.api";
import { useAuth } from "@/hooks/useAuth";

export default function ManagerInventoryPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"catalog" | "requests" | "transactions" | "traceability">("catalog");

  // Data states
  const [materials, setMaterials] = useState<Material[]>([]);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState("ALL");

  // Modal States
  const [isAddMaterialModalOpen, setIsAddMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [isStockTxModalOpen, setIsStockTxModalOpen] = useState(false);
  const [selectedMaterialForTx, setSelectedMaterialForTx] = useState<Material | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [activeRequestForApproval, setActiveRequestForApproval] = useState<MaterialRequest | null>(null);

  // Form states
  const [materialForm, setMaterialForm] = useState<CreateMaterialPayload>({
    name: "",
    code: "",
    category: "Fiber Cable",
    unit: "meter",
    description: "",
    minimumStock: 10,
    currentStock: 0,
    unitPrice: 0,
    location: "Main Store",
    isActive: true,
  });

  const [stockTxForm, setStockTxForm] = useState<{
    materialId: string;
    transactionType: "STOCK_IN" | "ADJUSTMENT" | "DAMAGE" | "TRANSFER";
    quantity: number;
    notes: string;
    reference: string;
    location: string;
  }>({
    materialId: "",
    transactionType: "STOCK_IN",
    quantity: 1,
    notes: "",
    reference: "",
    location: "Main Store",
  });

  const [approvalQuantities, setApprovalQuantities] = useState<Record<string, number>>({});
  const [approvalNotes, setApprovalNotes] = useState("");

  const categories = [
    "Fiber Cable",
    "Drop Cable",
    "Ethernet Cable",
    "Connector",
    "Fiber Closure",
    "Splice Sleeve",
    "ONU",
    "ONT",
    "Router",
    "STB",
    "Power Adapter",
    "Pole Hardware",
    "Installation Accessories",
    "Tools",
    "Other",
  ];

  const units = ["piece", "meter", "roll", "box", "pair", "set"];

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const [matsRes, reqsRes, txsRes, sumRes] = await Promise.all([
        inventoryApi.getMaterials({ limit: 100 }),
        inventoryApi.getMaterialRequests({ limit: 100 }),
        inventoryApi.getStockTransactions({ limit: 100 }),
        inventoryApi.getInventorySummary().catch(() => ({ success: false, data: null })),
      ]);

      setMaterials(matsRes.data || []);
      setRequests(reqsRes.data || []);
      setTransactions(txsRes.data || []);
      if (sumRes.data) {
        setSummary(sumRes.data);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Filtered Materials
  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = categoryFilter === "ALL" || m.category === categoryFilter;
      const matchesLowStock = !lowStockOnly || m.currentStock <= m.minimumStock;

      return matchesSearch && matchesCat && matchesLowStock;
    });
  }, [materials, searchQuery, categoryFilter, lowStockOnly]);

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (requestStatusFilter === "ALL") return true;
      return r.status === requestStatusFilter;
    });
  }, [requests, requestStatusFilter]);

  // Handle Material Create / Update
  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await inventoryApi.updateMaterial(editingMaterial._id, materialForm);
        showSuccess(`Material "${materialForm.name}" updated successfully.`);
      } else {
        await inventoryApi.createMaterial(materialForm);
        showSuccess(`Material "${materialForm.name}" created successfully.`);
      }
      setIsAddMaterialModalOpen(false);
      setEditingMaterial(null);
      loadAllData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save material");
    }
  };

  // Handle Stock Transaction Submit
  const handleStockTxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockTxForm.materialId || stockTxForm.quantity <= 0) {
      setError("Please select a material and enter a positive quantity.");
      return;
    }

    try {
      await inventoryApi.recordStockTransaction(stockTxForm);
      showSuccess(`Stock transaction (${stockTxForm.transactionType}) recorded successfully.`);
      setIsStockTxModalOpen(false);
      loadAllData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to record stock transaction");
    }
  };

  // Open Approval Modal
  const handleOpenApproval = (req: MaterialRequest) => {
    setActiveRequestForApproval(req);
    const initialQtyMap: Record<string, number> = {};
    req.items.forEach((item) => {
      const matId = typeof item.material === "object" ? item.material._id : item.material;
      initialQtyMap[matId] = item.approvedQuantity || item.requestedQuantity;
    });
    setApprovalQuantities(initialQtyMap);
    setApprovalNotes(req.approvalNotes || "");
    setIsApprovalModalOpen(true);
  };

  // Submit Approval
  const handleApproveRequest = async (approved: boolean) => {
    if (!activeRequestForApproval) return;
    try {
      const items = Object.entries(approvalQuantities).map(([matId, approvedQuantity]) => ({
        materialId: matId,
        approvedQuantity: Number(approvedQuantity),
      }));

      await inventoryApi.approveMaterialRequest(activeRequestForApproval._id, {
        approved,
        approvalNotes,
        items,
      });

      showSuccess(`Material request ${approved ? "approved" : "rejected"} successfully.`);
      setIsApprovalModalOpen(false);
      setActiveRequestForApproval(null);
      loadAllData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update material request status");
    }
  };

  // Issue Materials
  const handleIssueMaterials = async (reqId: string) => {
    try {
      await inventoryApi.issueMaterialRequest(reqId, {});
      showSuccess("Materials issued to technician and deducted from store stock.");
      loadAllData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to issue materials");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Package className="h-7 w-7 text-indigo-400" />
            Material & Inventory Management
          </h1>
          <p className="text-sm text-slate-400">
            Field stock tracking, technician material requests, consumption auditing & warehouse control
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => loadAllData()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setStockTxForm({
                materialId: materials[0]?._id || "",
                transactionType: "STOCK_IN",
                quantity: 10,
                notes: "Direct store stock receipt",
                reference: "PO-" + Math.floor(1000 + Math.random() * 9000),
                location: "Main Store",
              });
              setIsStockTxModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <ArrowDownRight className="h-3.5 w-3.5" />
            Stock In / Adjust
          </button>
          <button
            onClick={() => {
              setEditingMaterial(null);
              setMaterialForm({
                name: "",
                code: "",
                category: "Fiber Cable",
                unit: "meter",
                description: "",
                minimumStock: 10,
                currentStock: 0,
                unitPrice: 0,
                location: "Main Store",
                isActive: true,
              });
              setIsAddMaterialModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            Add Material
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="flex items-center justify-between rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-xs hover:underline">Dismiss</button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Materials</span>
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {summary?.totalMaterials ?? materials.length}
          </div>
          <p className="mt-1 text-xs text-slate-400">Catalog active SKUs</p>
        </div>

        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-300">Low Stock Alerts</span>
            <div className="rounded-lg bg-amber-500/10 p-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-300">
            {summary?.lowStockCount ?? materials.filter((m) => m.currentStock <= m.minimumStock).length}
          </div>
          <p className="mt-1 text-xs text-amber-400/80">Items below minimum threshold</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Pending Requests</span>
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            {summary?.pendingRequestsCount ?? requests.filter((r) => r.status === "PENDING").length}
          </div>
          <p className="mt-1 text-xs text-slate-400">Technician duty requests</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Store Valuation</span>
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400">
              <Boxes className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-white">
            ₹{summary?.totalValuation?.toLocaleString("en-IN") || "0"}
          </div>
          <p className="mt-1 text-xs text-slate-400">Main store asset valuation</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-800">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "catalog"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="h-4 w-4" />
            Material Catalog & Stock ({materials.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "requests"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="h-4 w-4" />
            Material Requests ({requests.length})
            {requests.some((r) => r.status === "PENDING") && (
              <span className="ml-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                {requests.filter((r) => r.status === "PENDING").length} New
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "transactions"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Stock Ledger & Audit ({transactions.length})
          </button>
          <button
            onClick={() => setActiveTab("traceability")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              activeTab === "traceability"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Duty Traceability
          </button>
        </nav>
      </div>

      {/* TAB 1: MATERIAL CATALOG */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search material SKU, name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-9 pr-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs font-medium text-slate-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <button
                onClick={() => setLowStockOnly(!lowStockOnly)}
                className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                  lowStockOnly
                    ? "border-amber-500 bg-amber-500/20 text-amber-300"
                    : "border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700"
                }`}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Low Stock Only
              </button>
            </div>
          </div>

          {/* Material Table */}
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Material / SKU</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Min. Stock</th>
                  <th className="px-4 py-3">Unit Price</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No materials found matching your filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMaterials.map((m) => {
                    const isLow = m.currentStock <= m.minimumStock;
                    return (
                      <tr key={m._id} className="hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-white">{m.name}</div>
                          <div className="text-xs font-mono text-indigo-400">{m.code}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="inline-block rounded-md bg-slate-800 px-2.5 py-1 text-xs text-slate-300 border border-slate-700">
                            {m.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold">
                          <span className={isLow ? "text-amber-400" : "text-emerald-400"}>
                            {m.currentStock} {m.unit}
                          </span>
                          {isLow && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                              LOW STOCK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">
                          {m.minimumStock} {m.unit}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-300">
                          ₹{m.unitPrice || 0}
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">{m.location}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                              m.isActive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-slate-700/50 text-slate-400"
                            }`}
                          >
                            {m.isActive ? "Active" : "Archived"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMaterialForTx(m);
                              setStockTxForm({
                                materialId: m._id,
                                transactionType: "STOCK_IN",
                                quantity: 10,
                                notes: `Stock receipt for ${m.name}`,
                                reference: "",
                                location: m.location,
                              });
                              setIsStockTxModalOpen(true);
                            }}
                            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 underline"
                          >
                            Stock-In
                          </button>
                          <button
                            onClick={() => {
                              setEditingMaterial(m);
                              setMaterialForm({
                                name: m.name,
                                code: m.code,
                                category: m.category,
                                unit: m.unit,
                                description: m.description || "",
                                minimumStock: m.minimumStock,
                                currentStock: m.currentStock,
                                unitPrice: m.unitPrice || 0,
                                location: m.location,
                                isActive: m.isActive,
                              });
                              setIsAddMaterialModalOpen(true);
                            }}
                            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 underline"
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MATERIAL REQUESTS */}
      {activeTab === "requests" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Filter Status:</span>
              {["ALL", "PENDING", "APPROVED", "ISSUED", "COMPLETED", "REJECTED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setRequestStatusFilter(st)}
                  className={`rounded-lg px-3 py-1 text-xs font-medium transition ${
                    requestStatusFilter === st
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-8 text-center text-slate-500">
                No material requests found.
              </div>
            ) : (
              filteredRequests.map((req) => {
                const techName = typeof req.technician === "object" ? req.technician.name : "Technician";
                const dutyTitle = typeof req.duty === "object" ? req.duty.dutyTitle : "Duty Assignment";
                const zoneName = typeof req.zone === "object" ? req.zone.name : "Zone Store";

                return (
                  <div
                    key={req._id}
                    className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition hover:border-slate-700"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-white">{dutyTitle}</span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                          <span>Requested by: <strong className="text-slate-200">{techName}</strong></span>
                          <span>•</span>
                          <span>Zone: <strong className="text-slate-200">{zoneName}</strong></span>
                          <span>•</span>
                          <span>Date: {new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Request Action Buttons */}
                      <div className="flex items-center gap-2">
                        {req.status === "PENDING" && (
                          <button
                            onClick={() => handleOpenApproval(req)}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                          >
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Review & Approve
                          </button>
                        )}
                        {req.status === "APPROVED" && (
                          <button
                            onClick={() => handleIssueMaterials(req._id)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                          >
                            <Send className="h-3.5 w-3.5" />
                            Issue Materials
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Items Breakdown */}
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

                    {req.requestNotes && (
                      <p className="mt-2.5 text-xs text-slate-400 bg-slate-950/40 rounded p-2 border border-slate-800/60">
                        <strong className="text-slate-300">Technician Note:</strong> {req.requestNotes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STOCK LEDGER & TRANSACTIONS */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 shadow">
            <table className="min-w-full divide-y divide-slate-800 text-left text-sm">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Stock Before / After</th>
                  <th className="px-4 py-3">Reference / Duty</th>
                  <th className="px-4 py-3">Performed By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No stock transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const mat = typeof tx.material === "object" ? tx.material : null;
                    const perf = typeof tx.performedBy === "object" ? tx.performedBy : null;
                    const duty = typeof tx.duty === "object" ? tx.duty : null;

                    const isPositive = tx.transactionType === "STOCK_IN" || tx.transactionType === "RETURN";

                    return (
                      <tr key={tx._id} className="hover:bg-slate-800/30 transition">
                        <td className="px-4 py-3.5 text-xs text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 font-medium text-white">
                          {mat ? mat.name : "Material"}
                          <div className="text-xs font-mono text-indigo-400">{mat?.code}</div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${
                              tx.transactionType === "STOCK_IN"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                : tx.transactionType === "STOCK_OUT"
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : tx.transactionType === "RETURN"
                                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                                : tx.transactionType === "DAMAGE"
                                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold">
                          <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                            {isPositive ? "+" : "-"}{tx.quantity} {mat?.unit || "units"}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs font-mono text-slate-300">
                          {tx.previousStock} → <strong className="text-white">{tx.newStock}</strong>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-400">
                          {duty ? duty.dutyTitle : tx.reference || "Store Adjustment"}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-slate-300">
                          {perf ? perf.name : "Manager"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TRACEABILITY */}
      {activeTab === "traceability" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              Full Material Traceability & Chain of Custody
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              Trace material SKU → Stock Transaction → Duty Work Order → Lead Technician → Zone Store → Consumption
            </p>

            <div className="mt-6 space-y-4">
              {requests.filter((r) => r.status === "ISSUED" || r.status === "COMPLETED").map((r) => {
                const duty = typeof r.duty === "object" ? r.duty : null;
                const tech = typeof r.technician === "object" ? r.technician : null;
                const zone = typeof r.zone === "object" ? r.zone : null;

                return (
                  <div key={r._id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="font-semibold text-indigo-300">
                        {duty ? duty.dutyTitle : "Work Order"}
                      </div>
                      <div className="text-xs text-slate-400">
                        Technician: <span className="text-slate-200 font-medium">{tech?.name || "Rahul Sharma"}</span> | Zone: <span className="text-slate-200 font-medium">{zone?.name || "Main Zone"}</span>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {r.items.map((item, i) => {
                        const mat = typeof item.material === "object" ? item.material : null;
                        return (
                          <div key={i} className="rounded border border-slate-800/80 bg-slate-900/70 p-3 text-xs">
                            <div className="font-medium text-white">{mat?.name || "Material"}</div>
                            <div className="text-slate-400 font-mono mt-0.5">{mat?.code}</div>
                            <div className="mt-2 flex items-center justify-between text-slate-300">
                              <span>Issued: <strong>{item.issuedQuantity}</strong></span>
                              <span>Used: <strong className="text-amber-400">{item.usedQuantity}</strong></span>
                              <span>Returned: <strong className="text-emerald-400">{item.returnedQuantity}</strong></span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT MATERIAL */}
      {isAddMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">
              {editingMaterial ? "Edit Material Catalog Item" : "Create Material SKU"}
            </h2>

            <form onSubmit={handleSaveMaterial} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  value={materialForm.name}
                  onChange={(e) => setMaterialForm({ ...materialForm, name: e.target.value })}
                  placeholder="e.g. 6-Core Armored Fiber Cable"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">SKU / Code *</label>
                  <input
                    type="text"
                    required
                    value={materialForm.code}
                    onChange={(e) => setMaterialForm({ ...materialForm, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FIB-6C-ARM"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category *</label>
                  <select
                    value={materialForm.category}
                    onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit *</label>
                  <select
                    value={materialForm.unit}
                    onChange={(e) => setMaterialForm({ ...materialForm, unit: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={materialForm.currentStock}
                    onChange={(e) => setMaterialForm({ ...materialForm, currentStock: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Min. Alert Stock</label>
                  <input
                    type="number"
                    min="0"
                    value={materialForm.minimumStock}
                    onChange={(e) => setMaterialForm({ ...materialForm, minimumStock: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={materialForm.unitPrice}
                    onChange={(e) => setMaterialForm({ ...materialForm, unitPrice: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Store Location</label>
                  <input
                    type="text"
                    value={materialForm.location}
                    onChange={(e) => setMaterialForm({ ...materialForm, location: e.target.value })}
                    placeholder="e.g. Main Store / North Hub"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={materialForm.description}
                  onChange={(e) => setMaterialForm({ ...materialForm, description: e.target.value })}
                  placeholder="Material specs and notes..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddMaterialModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  {editingMaterial ? "Update Material" : "Create Material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK TRANSACTION (STOCK-IN / ADJUSTMENT) */}
      {isStockTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4">Record Stock Movement</h2>

            <form onSubmit={handleStockTxSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Select Material *</label>
                <select
                  value={stockTxForm.materialId}
                  onChange={(e) => setStockTxForm({ ...stockTxForm, materialId: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  {materials.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.code}) - Current: {m.currentStock} {m.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Transaction Type *</label>
                  <select
                    value={stockTxForm.transactionType}
                    onChange={(e) =>
                      setStockTxForm({
                        ...stockTxForm,
                        transactionType: e.target.value as "STOCK_IN" | "ADJUSTMENT" | "DAMAGE" | "TRANSFER",
                      })
                    }
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="STOCK_IN">STOCK_IN (Receipt)</option>
                    <option value="ADJUSTMENT">ADJUSTMENT (Count Correction)</option>
                    <option value="DAMAGE">DAMAGE (Scrap/Loss)</option>
                    <option value="TRANSFER">TRANSFER (Location Move)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Quantity *</label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={stockTxForm.quantity}
                    onChange={(e) => setStockTxForm({ ...stockTxForm, quantity: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Reference / PO Number</label>
                <input
                  type="text"
                  value={stockTxForm.reference}
                  onChange={(e) => setStockTxForm({ ...stockTxForm, reference: e.target.value })}
                  placeholder="e.g. PO-9842 / GRN-204"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Notes / Reason</label>
                <textarea
                  rows={2}
                  value={stockTxForm.notes}
                  onChange={(e) => setStockTxForm({ ...stockTxForm, notes: e.target.value })}
                  placeholder="Additional notes for transaction audit..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStockTxModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  Commit Stock Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE / REJECT REQUEST */}
      {isApprovalModalOpen && activeRequestForApproval && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-2">Review Material Request</h2>
            <p className="text-xs text-slate-400 mb-4">
              Authorize requested quantities for technician duty execution.
            </p>

            <div className="space-y-3">
              {activeRequestForApproval.items.map((item, idx) => {
                const mat = typeof item.material === "object" ? item.material : null;
                const matId = mat ? mat._id : (item.material as string);
                const matName = mat ? mat.name : "Material";
                const unit = mat ? mat.unit : "units";

                return (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-800/40 p-3">
                    <div>
                      <div className="text-sm font-semibold text-white">{matName}</div>
                      <div className="text-xs text-slate-400">
                        Requested: <strong className="text-amber-400">{item.requestedQuantity} {unit}</strong> | Available in Store: <strong className="text-slate-200">{mat?.currentStock || 0} {unit}</strong>
                      </div>
                    </div>
                    <div className="w-24">
                      <label className="block text-[10px] text-slate-400 mb-0.5">Approved Qty</label>
                      <input
                        type="number"
                        min="0"
                        value={approvalQuantities[matId] ?? item.requestedQuantity}
                        onChange={(e) =>
                          setApprovalQuantities({
                            ...approvalQuantities,
                            [matId]: Number(e.target.value),
                          })
                        }
                        className="w-full rounded border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                );
              })}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Approval Comments</label>
                <textarea
                  rows={2}
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Approval notes or instructions..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleApproveRequest(false)}
                className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
              >
                Reject Request
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsApprovalModalOpen(false)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleApproveRequest(true)}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  Approve Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
