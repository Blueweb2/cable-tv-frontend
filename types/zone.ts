export interface NodeItem {
  _id?: string;
  nodeNumber: string;
  location?: string;
  opticalPowerDbm?: string;
  status: "HEALTHY" | "WARNING" | "CRITICAL" | "OFFLINE";
  amplifierCount?: number;
}

export interface Zone {
  _id: string;
  name: string;
  code: string;
  zoneType: "FIBER_FTTH" | "COAXIAL_GRID" | "HYBRID_HFC" | "COMMERCIAL_HUB" | "RESIDENTIAL_SECTOR";
  coverageArea: string;
  totalSubscribers: number;
  nodes: NodeItem[];
  assignedLead?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
  } | null;
  assignedStaff?: Array<{
    _id: string;
    name: string;
    email: string;
    phone?: string;
    department?: string;
  }>;
  status: "OPERATIONAL" | "MAINTENANCE" | "DEGRADED" | "OUTAGE";
  notes?: string;
  activeDutiesCount?: number;
  criticalAlertsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}
