import { BaseEntity, MongoId } from "./index";

export type MaterialCategory =
  | "Fiber Cable"
  | "Drop Cable"
  | "Ethernet Cable"
  | "Connector"
  | "Fiber Closure"
  | "Splice Sleeve"
  | "ONU"
  | "ONT"
  | "Router"
  | "STB"
  | "Power Adapter"
  | "Pole Hardware"
  | "Installation Accessories"
  | "Tools"
  | "Other"
  | string;

export type MaterialUnit =
  | "piece"
  | "meter"
  | "roll"
  | "box"
  | "pair"
  | "set"
  | string;

export type StockTransactionType =
  | "STOCK_IN"
  | "STOCK_OUT"
  | "ADJUSTMENT"
  | "RETURN"
  | "DAMAGE"
  | "TRANSFER";

export type MaterialRequestStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ISSUED"
  | "COMPLETED"
  | "CANCELLED";

export type RequestItemStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "ISSUED"
  | "PARTIALLY_RETURNED"
  | "RETURNED"
  | "COMPLETED";

export interface Material extends BaseEntity {
  name: string;
  code: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  description?: string;
  minimumStock: number;
  currentStock: number;
  unitPrice?: number;
  location: string;
  isActive: boolean;
  isLowStock?: boolean;
}

export interface StockTransaction extends BaseEntity {
  material: Material | MongoId;
  location: string;
  transactionType: StockTransactionType;
  quantity: number;
  previousStock: number;
  newStock: number;
  duty?: MongoId | { _id: MongoId; dutyTitle: string; nodeNumber?: string };
  technician?: MongoId | { _id: MongoId; name: string; employeeId?: string };
  materialRequest?: MongoId;
  reference?: string;
  performedBy: MongoId | { _id: MongoId; name: string; role: string };
  notes?: string;
}

export interface RequestItem {
  _id?: MongoId;
  material: Material | MongoId;
  requestedQuantity: number;
  approvedQuantity: number;
  issuedQuantity: number;
  usedQuantity: number;
  returnedQuantity: number;
  status: RequestItemStatus;
}

export interface MaterialRequest extends BaseEntity {
  duty: MongoId | { _id: MongoId; dutyTitle: string; nodeNumber?: string; location?: string };
  technician: MongoId | { _id: MongoId; name: string; employeeId?: string; email?: string; phone?: string };
  zone?: MongoId | { _id: MongoId; name: string; code?: string };
  items: RequestItem[];
  status: MaterialRequestStatus;
  requestNotes?: string;
  approvalNotes?: string;
  approvedBy?: MongoId | { _id: MongoId; name: string };
  approvedAt?: string;
  issuedBy?: MongoId | { _id: MongoId; name: string };
  issuedAt?: string;
}

export interface InventorySummary {
  totalMaterials: number;
  lowStockCount: number;
  totalValuation: number;
  pendingRequestsCount: number;
  categorySummary: Record<string, number>;
  recentTransactions: StockTransaction[];
}

export interface CreateMaterialPayload {
  name: string;
  code: string;
  category: string;
  unit: string;
  description?: string;
  minimumStock?: number;
  currentStock?: number;
  unitPrice?: number;
  location?: string;
  isActive?: boolean;
}

export interface StockTransactionPayload {
  materialId: MongoId;
  transactionType: StockTransactionType;
  quantity: number;
  dutyId?: MongoId;
  technicianId?: MongoId;
  reference?: string;
  notes?: string;
  location?: string;
}

export interface CreateMaterialRequestPayload {
  dutyId: MongoId;
  technicianId?: MongoId;
  items: Array<{
    materialId: MongoId;
    requestedQuantity: number;
  }>;
  requestNotes?: string;
}

export interface ApproveMaterialRequestPayload {
  approved: boolean;
  approvalNotes?: string;
  items?: Array<{
    materialId: MongoId;
    approvedQuantity: number;
  }>;
}

export interface IssueMaterialRequestPayload {
  items?: Array<{
    materialId: MongoId;
    issuedQuantity: number;
  }>;
  notes?: string;
}

export interface MaterialConsumptionPayload {
  items: Array<{
    materialId: MongoId;
    usedQuantity: number;
    returnedQuantity: number;
  }>;
}
