import { get, ApiResponse } from "./api";

export interface DepartmentStaffMember {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  employeeId: string;
  department: string;
  location: string;
  status: "AVAILABLE" | "ON_LEAVE" | "ASSIGNED_OTHER" | "ASSIGNED_THIS_EVENT" | "ASSIGNED";
  statusLabel: string;
  statusReason: string;
  isAvailable: boolean;
}

export interface StaffingStream {
  streamId: string;
  streamType: "CATERING" | "SERVICE" | "OPERATIONS";
  title: string;
  department: string;
  category: string;
  description: string;
  specDetails: {
    guests?: number;
    servingType?: string;
    ratePerGuest?: number;
    totalFoodAmount?: number;
    itemsCount?: number;
    items?: Array<{
      _id?: string;
      name: string;
      category: string;
      dietary: string;
      quantity?: number;
      rate?: number;
      amount?: number;
    }>;
    quantity?: number;
    pricingType?: string;
    unitLabel?: string;
    unitPrice?: number;
    total?: number;
    location?: string;
  };
  recommendedStaffCount: number;
  allocatedCount: number;
  assignedDuties: Array<{
    _id: string;
    dutyTitle: string;
    role?: string;
    startTime: string;
    endTime: string;
    status: string;
    staff?: {
      _id: string;
      name: string;
      email: string;
      department?: string;
    };
  }>;
  departmentStaff: DepartmentStaffMember[];
}

export interface DepartmentSummaryItem {
  department: string;
  total: number;
  available: number;
  onLeave: number;
  assigned: number;
  staff: DepartmentStaffMember[];
}

export interface DateAvailabilityResponse {
  date: string;
  totalStaff: number;
  availableStaff: number;
  onLeaveStaff: number;
  assignedStaff: number;
  departments: DepartmentSummaryItem[];
  staff: DepartmentStaffMember[];
}

/**
 * Get organization-wide department availability for a given date
 */
export async function getDepartmentAvailability(
  date?: string,
  token?: string
): Promise<ApiResponse<DateAvailabilityResponse>> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return get<ApiResponse<DateAvailabilityResponse>>(
    `/departments/availability${query}`,
    token
  );
}
