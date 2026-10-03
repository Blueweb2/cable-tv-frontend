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

export interface StaffRecommendation {
  _id: string;
  id: string;
  name: string;
  email: string;
  phone: string;
  department?: string;
  specialization?: string;
  location?: string;
  employeeId?: string;
  matchScore: number;
  availabilityStatus: string;
  activeDutiesCount: number;
  matchReasons: string[];
}

export interface RecommendationQueryParams {
  department?: string;
  specialization?: string;
  jobType?: string;
  serviceName?: string;
  zone?: string;
  date?: string;
}

/**
 * Get intelligent technician recommendations for field duty assignment
 */
export async function getStaffRecommendations(
  params?: RecommendationQueryParams,
  token?: string
): Promise<ApiResponse<StaffRecommendation[]>> {
  const queryParts: string[] = [];
  if (params?.department) queryParts.push(`department=${encodeURIComponent(params.department)}`);
  if (params?.specialization) queryParts.push(`specialization=${encodeURIComponent(params.specialization)}`);
  if (params?.jobType) queryParts.push(`jobType=${encodeURIComponent(params.jobType)}`);
  if (params?.serviceName) queryParts.push(`serviceName=${encodeURIComponent(params.serviceName)}`);
  if (params?.zone) queryParts.push(`zone=${encodeURIComponent(params.zone)}`);
  if (params?.date) queryParts.push(`date=${encodeURIComponent(params.date)}`);

  const qs = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
  return get<ApiResponse<StaffRecommendation[]>>(`/departments/recommendations${qs}`, token);
}

