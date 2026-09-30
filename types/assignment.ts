import type { Staff } from "./staff";
import type { Zone } from "./zone";

// ==========================================
// ASSIGNMENT STATUS & TYPES
// ==========================================

export type AssignmentStatus =
  | "ASSIGNED"
  | "ACCEPTED"
  | "REJECTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type JobType =
  | "FIBER_SPLICING"
  | "LINE_REPAIR"
  | "NEW_INSTALLATION"
  | "NODE_MAINTENANCE"
  | "SIGNAL_OPTIMIZATION"
  | "COMPLAINT_RESOLUTION"
  | "PAYMENT_COLLECTION"
  | "FIELD_PATROL"
  | "GENERAL_SHIFT";

export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL_OUTAGE";

export type PhotoType =
  | "BEFORE_WORK"
  | "IN_PROGRESS"
  | "AFTER_WORK"
  | "DAMAGE_EVIDENCE"
  | "METER_READING"
  | "OTHER";

export interface SitePhoto {
  _id?: string;
  url: string;
  caption?: string;
  photoType?: PhotoType;
  uploadedAt?: string;
  uploadedBy?: {
    _id?: string;
    name?: string;
  };
}

export interface SiteLocation {
  address?: string;
  landmark?: string;
  poleNumber?: string;
  distributionBox?: string;
  googleMapsUrl?: string;
  coordinates?: {
    lat?: number | null;
    lng?: number | null;
  };
}

export interface ProblemDetails {
  issueCategory?: string;
  faultDescription?: string;
  affectedSubscribersCount?: number;
  reportedBy?: string;
  reportedPhone?: string;
  initialOpticalPowerDbm?: string;
}

export type AssignmentStaff = Pick<
  Staff,
  | "id"
  | "name"
  | "username"
  | "email"
  | "phone"
  | "employeeId"
  | "department"
  | "location"
>;

export type AssignmentCreatedBy = {
  _id: string;
  name: string;
  username: string;
  email: string;
};

export interface SubscriberInfo {
  name?: string;
  phone?: string;
  accountNo?: string;
  address?: string;
}

export type Assignment = {
  _id: string;
  zone?: string | Zone | null;
  zoneName?: string;
  nodeNumber?: string;
  staff: string | AssignmentStaff;
  dutyTitle: string;
  jobType?: JobType;
  priority?: PriorityLevel;
  role?: string;
  department?: string;
  serviceName?: string;
  description?: string;
  location?: string;
  siteLocation?: SiteLocation;
  problemDetails?: ProblemDetails;
  sitePhotos?: SitePhoto[];
  finalOpticalPowerDbm?: string;
  subscriber?: SubscriberInfo;
  dutyDate: string;
  startTime: string;
  endTime: string;
  status: AssignmentStatus;
  rejectionReason?: string;
  respondedAt?: string;
  hourlyRate?: number;
  totalHours?: number;
  totalAmount?: number;
  paymentStatus?: "PENDING" | "PAID" | "PROCESSING";
  paidAt?: string;
  paymentReference?: string;
  notes?: string;
  resolutionSummary?: string;
  checklist?: Array<{ _id?: string; text: string; completed: boolean }>;
  tasks?: Array<{
    _id?: string;
    title: string;
    description?: string;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "SKIPPED";
  }>;
  assignedBy?: string | AssignmentCreatedBy;
  event?: any;
  createdAt: string;
  updatedAt: string;
};

export type CreateAssignmentPayload = {
  zone?: string;
  zoneName?: string;
  nodeNumber?: string;
  staff: string;
  dutyTitle: string;
  jobType?: JobType;
  priority?: PriorityLevel;
  role?: string;
  department?: string;
  serviceName?: string;
  description?: string;
  location?: string;
  siteLocation?: SiteLocation;
  problemDetails?: ProblemDetails;
  subscriber?: SubscriberInfo;
  dutyDate: string;
  startTime: string;
  endTime: string;
  hourlyRate?: number;
  notes?: string;
  checklist?: Array<{ text: string; completed?: boolean } | string>;
};

export type UpdateAssignmentPayload = Partial<CreateAssignmentPayload> & {
  status?: AssignmentStatus;
  rejectionReason?: string;
  resolutionSummary?: string;
  finalOpticalPowerDbm?: string;
  paymentStatus?: "PENDING" | "PAID" | "PROCESSING";
  paymentReference?: string;
};

export type AssignmentFilters = {
  zone?: string;
  staff?: string;
  jobType?: string;
  priority?: string;
  status?: AssignmentStatus | "ALL";
  date?: string;
  dutyDate?: string;
  startDate?: string;
  endDate?: string;
  department?: string;
  search?: string;
  page?: number;
  limit?: number;
};

export type AssignmentPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AssignmentListResponse = {
  success: boolean;
  data: Assignment[];
  pagination: AssignmentPagination;
};

export type AssignmentResponse = {
  success: boolean;
  message?: string;
  data: {
    assignment: Assignment;
  };
};