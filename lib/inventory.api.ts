import { get, post, put, patch, del, ApiResponse } from "./api";
import {
  Material,
  StockTransaction,
  MaterialRequest,
  InventorySummary,
  CreateMaterialPayload,
  StockTransactionPayload,
  CreateMaterialRequestPayload,
  ApproveMaterialRequestPayload,
  IssueMaterialRequestPayload,
  MaterialConsumptionPayload,
  MongoId,
} from "../types";

export const inventoryApi = {
  // ==========================================
  // 1. MATERIAL CATALOG
  // ==========================================
  getMaterials: async (params?: {
    search?: string;
    category?: string;
    lowStock?: boolean;
    isActive?: boolean | string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: Material[]; pagination?: { total: number; page: number; pages: number } }> => {
    const query = new URLSearchParams();
    if (params?.search) query.append("search", params.search);
    if (params?.category) query.append("category", params.category);
    if (params?.lowStock !== undefined) query.append("lowStock", String(params.lowStock));
    if (params?.isActive !== undefined) query.append("isActive", String(params.isActive));
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    return get<{ success: boolean; data: Material[]; pagination?: { total: number; page: number; pages: number } }>(
      `/inventory/materials${qs ? `?${qs}` : ""}`
    );
  },

  getMaterialById: async (id: MongoId): Promise<ApiResponse<Material>> => {
    return get<ApiResponse<Material>>(`/inventory/materials/${id}`);
  },

  createMaterial: async (payload: CreateMaterialPayload): Promise<ApiResponse<Material>> => {
    return post<ApiResponse<Material>>("/inventory/materials", payload);
  },

  updateMaterial: async (id: MongoId, payload: Partial<CreateMaterialPayload>): Promise<ApiResponse<Material>> => {
    return put<ApiResponse<Material>>(`/inventory/materials/${id}`, payload);
  },

  deleteMaterial: async (id: MongoId): Promise<{ success: boolean; message: string }> => {
    return del<{ success: boolean; message: string }>(`/inventory/materials/${id}`);
  },

  // ==========================================
  // 2. STOCK TRANSACTIONS
  // ==========================================
  getStockTransactions: async (params?: {
    material?: MongoId;
    transactionType?: string;
    duty?: MongoId;
    technician?: MongoId;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: StockTransaction[]; pagination?: { total: number; page: number; pages: number } }> => {
    const query = new URLSearchParams();
    if (params?.material) query.append("material", params.material);
    if (params?.transactionType) query.append("transactionType", params.transactionType);
    if (params?.duty) query.append("duty", params.duty);
    if (params?.technician) query.append("technician", params.technician);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    return get<{ success: boolean; data: StockTransaction[]; pagination?: { total: number; page: number; pages: number } }>(
      `/inventory/transactions${qs ? `?${qs}` : ""}`
    );
  },

  recordStockTransaction: async (payload: StockTransactionPayload): Promise<ApiResponse<StockTransaction>> => {
    return post<ApiResponse<StockTransaction>>("/inventory/transactions", payload);
  },

  // ==========================================
  // 3. MATERIAL REQUESTS & WORKFLOWS
  // ==========================================
  getMaterialRequests: async (params?: {
    duty?: MongoId;
    technician?: MongoId;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ success: boolean; data: MaterialRequest[]; pagination?: { total: number; page: number; pages: number } }> => {
    const query = new URLSearchParams();
    if (params?.duty) query.append("duty", params.duty);
    if (params?.technician) query.append("technician", params.technician);
    if (params?.status) query.append("status", params.status);
    if (params?.page) query.append("page", String(params.page));
    if (params?.limit) query.append("limit", String(params.limit));

    const qs = query.toString();
    return get<{ success: boolean; data: MaterialRequest[]; pagination?: { total: number; page: number; pages: number } }>(
      `/inventory/requests${qs ? `?${qs}` : ""}`
    );
  },

  getMaterialRequestById: async (id: MongoId): Promise<ApiResponse<MaterialRequest>> => {
    return get<ApiResponse<MaterialRequest>>(`/inventory/requests/${id}`);
  },

  createMaterialRequest: async (payload: CreateMaterialRequestPayload): Promise<ApiResponse<MaterialRequest>> => {
    return post<ApiResponse<MaterialRequest>>("/inventory/requests", payload);
  },

  approveMaterialRequest: async (
    id: MongoId,
    payload: ApproveMaterialRequestPayload
  ): Promise<ApiResponse<MaterialRequest>> => {
    return patch<ApiResponse<MaterialRequest>>(`/inventory/requests/${id}/approve`, payload);
  },

  issueMaterialRequest: async (
    id: MongoId,
    payload: IssueMaterialRequestPayload
  ): Promise<ApiResponse<MaterialRequest>> => {
    return patch<ApiResponse<MaterialRequest>>(`/inventory/requests/${id}/issue`, payload);
  },

  recordMaterialConsumption: async (
    id: MongoId,
    payload: MaterialConsumptionPayload
  ): Promise<ApiResponse<MaterialRequest>> => {
    return patch<ApiResponse<MaterialRequest>>(`/inventory/requests/${id}/consume`, payload);
  },

  cancelMaterialRequest: async (id: MongoId): Promise<{ success: boolean; message: string }> => {
    return patch<{ success: boolean; message: string }>(`/inventory/requests/${id}/cancel`, {});
  },

  // ==========================================
  // 4. SUMMARY & METRICS
  // ==========================================
  getInventorySummary: async (): Promise<ApiResponse<InventorySummary>> => {
    return get<ApiResponse<InventorySummary>>("/inventory/summary");
  },
};
