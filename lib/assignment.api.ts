import {
  get,
  post,
  put,
  patch,
  del,
  type ApiResponse,
} from "./api";

import type {
  Assignment,
  AssignmentStatus,
  CreateAssignmentPayload,
  UpdateAssignmentPayload,
  AssignmentListResponse,
  SitePhoto,
} from "@/types/assignment";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ==========================================
// FILTER PARAMETERS
// ==========================================

export type GetAssignmentsParams = {
  zone?: string;
  staff?: string;
  status?: AssignmentStatus | "ALL";
  priority?: string;
  jobType?: string;
  paymentStatus?: "PENDING" | "PAID" | "PROCESSING";
  dutyDate?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  department?: string;
  page?: number;
  limit?: number;
  event?: string;
};

// ==========================================
// CREATE ASSIGNMENT / FIELD DUTY
// POST /api/assignments
// ==========================================

export const createAssignment = async (
  payload: CreateAssignmentPayload,
  token: string,
): Promise<Assignment> => {
  const result = await post<
    ApiResponse<{
      assignment: Assignment;
    }>
  >("/assignments", payload, token);

  return result.data.assignment;
};

// ==========================================
// GET ASSIGNMENTS
// GET /api/assignments
// ==========================================

export const getAssignments = async (
  token: string,
  params?: GetAssignmentsParams,
): Promise<AssignmentListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.zone) searchParams.set("zone", params.zone);
  if (params?.staff) searchParams.set("staff", params.staff);
  if (params?.status && params.status !== "ALL") searchParams.set("status", params.status);
  if (params?.priority && params.priority !== "ALL") searchParams.set("priority", params.priority);
  if (params?.jobType && params.jobType !== "ALL") searchParams.set("jobType", params.jobType);
  if (params?.paymentStatus) searchParams.set("paymentStatus", params.paymentStatus);
  if (params?.dutyDate) searchParams.set("dutyDate", params.dutyDate);
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.department) searchParams.set("department", params.department);
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const endpoint = query ? `/assignments?${query}` : "/assignments";

  return get<AssignmentListResponse>(endpoint, token);
};

// ==========================================
// GET ASSIGNMENT BY ID
// GET /api/assignments/:id
// ==========================================

export const getAssignmentById = async (
  id: string,
  token: string,
): Promise<Assignment> => {
  if (!id) throw new Error("Assignment ID is required");

  const result = await get<
    ApiResponse<{
      assignment: Assignment;
    }>
  >(`/assignments/${id}`, token);

  return result.data.assignment;
};

// ==========================================
// UPDATE ASSIGNMENT
// PUT /api/assignments/:id
// ==========================================

export const updateAssignment = async (
  id: string,
  payload: UpdateAssignmentPayload,
  token: string,
): Promise<Assignment> => {
  if (!id) throw new Error("Assignment ID is required");

  const result = await put<
    ApiResponse<{
      assignment: Assignment;
    }>
  >(`/assignments/${id}`, payload, token);

  return result.data.assignment;
};

// ==========================================
// DELETE ASSIGNMENT
// DELETE /api/assignments/:id
// ==========================================

export const deleteAssignment = async (
  id: string,
  token: string,
): Promise<void> => {
  if (!id) throw new Error("Assignment ID is required");

  await del<ApiResponse<unknown>>(`/assignments/${id}`, token);
};

// ==========================================
// UPLOAD SITE PHOTO PROOF (Staff / Tech)
// POST /api/assignments/:id/photos
// ==========================================

export const uploadSitePhoto = async (
  dutyId: string,
  fileOrUrl: File | string,
  metadata: { caption?: string; photoType?: string },
  token: string
): Promise<{ duty: Assignment; photo: SitePhoto }> => {
  if (typeof fileOrUrl === "string") {
    // URL upload
    const res = await fetch(`${API_BASE_URL}/assignments/${dutyId}/photos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url: fileOrUrl,
        caption: metadata.caption || "",
        photoType: metadata.photoType || "AFTER_WORK",
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to upload photo");
    return data.data;
  }

  // File upload via FormData
  const formData = new FormData();
  formData.append("photo", fileOrUrl);
  if (metadata.caption) formData.append("caption", metadata.caption);
  if (metadata.photoType) formData.append("photoType", metadata.photoType);

  const res = await fetch(`${API_BASE_URL}/assignments/${dutyId}/photos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to upload photo file");
  return data.data;
};

// ==========================================
// DELETE SITE PHOTO
// DELETE /api/assignments/:id/photos/:photoId
// ==========================================

export const deleteSitePhoto = async (
  dutyId: string,
  photoId: string,
  token: string
): Promise<Assignment> => {
  const result = await del<ApiResponse<{ duty: Assignment }>>(
    `/assignments/${dutyId}/photos/${photoId}`,
    token
  );
  return result.data.duty;
};

// ==========================================
// ACCEPT ASSIGNMENT (Technician Shift Acceptance)
// PATCH /api/assignments/:id/accept
// ==========================================

export const acceptAssignment = async (
  id: string,
  token: string
): Promise<Assignment> => {
  if (!id) throw new Error("Assignment ID is required");

  const result = await patch<
    ApiResponse<{
      assignment: Assignment;
    }>
  >(`/assignments/${id}/accept`, {}, token);

  return result.data.assignment;
};

// ==========================================
// REJECT ASSIGNMENT (Technician Decline)
// PATCH /api/assignments/:id/reject
// ==========================================

export const rejectAssignment = async (
  id: string,
  reason: string,
  token: string
): Promise<Assignment> => {
  if (!id) throw new Error("Assignment ID is required");

  const result = await patch<
    ApiResponse<{
      assignment: Assignment;
    }>
  >(`/assignments/${id}/reject`, { reason }, token);

  return result.data.assignment;
};

// ==========================================
// TOGGLE CHECKLIST ITEM
// PATCH /api/assignments/:id/checklist/toggle
// ==========================================

export const toggleDutyChecklistItem = async (
  id: string,
  itemIndex: number,
  completed: boolean,
  token: string
): Promise<Assignment> => {
  const result = await patch<
    ApiResponse<{
      assignment: Assignment;
    }>
  >(`/assignments/${id}/checklist/toggle`, { itemIndex, completed }, token);

  return result.data.assignment;
};

// ==========================================
// COMPLETE DUTY WITH RESOLUTION
// PATCH /api/assignments/:id/complete
// ==========================================

export const completeDutyWorkOrder = async (
  id: string,
  payload: { resolutionSummary?: string; notes?: string; finalOpticalPowerDbm?: string },
  token: string
): Promise<Assignment> => {
  const result = await patch<
    ApiResponse<{
      assignment: Assignment;
    }>
  >(`/assignments/${id}/complete`, payload, token);

  return result.data.assignment;
};

export const updateAssignmentChecklist = toggleDutyChecklistItem;
export const startTask = async (dutyId: string, taskId: string, token: string) => {
  return getAssignmentById(dutyId, token);
};
export const completeTask = async (dutyId: string, taskId: string, notes: string, token: string) => {
  return getAssignmentById(dutyId, token);
};
export const getEventTaskProgress = async (eventId: string, token: string) => {
  return { tasks: [], summary: {} };
};