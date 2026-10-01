import {
  get,
  post,
  patch,
  del,
  ApiResponse,
} from "./api";

import type {
  Attendance,
  CheckInPayload,
  CheckOutPayload,
  MarkAbsentPayload,
  AttendanceFilters,
  AttendanceListResponse,
  UpdateAttendancePayload,
} from "@/types/attendance";

// ==========================================
// CHECK IN
// POST /api/attendance/check-in
// ==========================================

export const checkIn = async (
  payload: CheckInPayload,
  token: string,
): Promise<Attendance> => {
  const result = await post<
    ApiResponse<{
      attendance: Attendance;
    }>
  >(
    "/attendance/check-in",
    payload,
    token,
  );

  return result.data.attendance;
};

// ==========================================
// CHECK OUT
// POST /api/attendance/check-out
// ==========================================

export const checkOut = async (
  payload: CheckOutPayload,
  token: string,
): Promise<Attendance> => {
  const result = await post<
    ApiResponse<{
      attendance: Attendance;
    }>
  >(
    "/attendance/check-out",
    payload,
    token,
  );

  return result.data.attendance;
};

// ==========================================
// PAUSE SHIFT
// POST /api/attendance/pause
// ==========================================

export const pauseStaffShift = async (
  arg1: string,
  arg2?: { duty?: string; dutyId?: string; reason?: string; notes?: string } | string,
  arg3?: string
): Promise<Attendance> => {
  let token = arg1;
  let payload = typeof arg2 === "object" ? arg2 : {};

  if (typeof arg3 === "string") {
    token = arg3;
    payload = typeof arg2 === "object" ? arg2 : {};
  }

  const result = await post<
    ApiResponse<{
      attendance: Attendance;
    }>
  >("/attendance/pause", payload, token);

  return result.data.attendance;
};

export const resumeStaffShift = async (
  arg1: string,
  arg2?: { duty?: string; dutyId?: string; notes?: string } | string,
  arg3?: string
): Promise<Attendance> => {
  let token = arg1;
  let payload = typeof arg2 === "object" ? arg2 : {};

  if (typeof arg3 === "string") {
    token = arg3;
    payload = typeof arg2 === "object" ? arg2 : {};
  }

  const result = await post<
    ApiResponse<{
      attendance: Attendance;
    }>
  >("/attendance/resume", payload, token);

  return result.data.attendance;
};

// ==========================================
// GET ATTENDANCE
// GET /api/attendance
// ==========================================

export const getAttendance = async (
  token: string,
  params?: AttendanceFilters,
): Promise<AttendanceListResponse> => {
  const searchParams = new URLSearchParams();

  if (params?.staff) searchParams.set("staff", params.staff);
  if (params?.zone) searchParams.set("zone", params.zone);
  if (params?.duty) searchParams.set("duty", params.duty);
  if (params?.date) searchParams.set("date", params.date);
  if (params?.startDate) searchParams.set("startDate", params.startDate);
  if (params?.endDate) searchParams.set("endDate", params.endDate);
  if (params?.status && params.status !== "ALL") searchParams.set("status", params.status);
  if (params?.page !== undefined) searchParams.set("page", String(params.page));
  if (params?.limit !== undefined) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  const endpoint = query ? `/attendance?${query}` : "/attendance";

  return get<AttendanceListResponse>(endpoint, token);
};

// ==========================================
// MARK ATTENDANCE (Manager Manual Entry)
// POST /api/attendance
// ==========================================

export const markAttendance = async (
  payload: any,
  token: string,
): Promise<Attendance> => {
  const result = await post<
    ApiResponse<{
      attendance: Attendance;
    }>
  >("/attendance", payload, token);

  return result.data.attendance;
};

// ==========================================
// MARK ABSENT
// POST /api/attendance
// ==========================================

export const markAbsent = async (
  payload: MarkAbsentPayload | { duty?: string; staff?: string; notes?: string; date?: string; zone?: string },
  token: string,
): Promise<Attendance> => {
  return markAttendance({ ...payload, status: "ABSENT" }, token);
};

// ==========================================
// UPDATE ATTENDANCE
// PATCH /api/attendance/:id
// ==========================================

export const updateAttendance = async (
  id: string,
  payload: UpdateAttendancePayload,
  token: string,
): Promise<Attendance> => {
  const result = await patch<
    ApiResponse<{
      attendance: Attendance;
    }>
  >(`/attendance/${id}`, payload, token);

  return result.data.attendance;
};

// ==========================================
// DELETE ATTENDANCE
// DELETE /api/attendance/:id
// ==========================================

export const deleteAttendance = async (
  id: string,
  token: string,
): Promise<{ success: boolean; message?: string }> => {
  return del<{ success: boolean; message?: string }>(`/attendance/${id}`, token);
};

export const checkInStaff = async (
  token: string,
  payload: CheckInPayload,
): Promise<Attendance> => checkIn(payload, token);

export const checkOutStaff = async (
  token: string,
  payload: CheckOutPayload,
): Promise<Attendance> => checkOut(payload, token);

export const getEventStaffAttendance = async (
  token: string,
  eventId: string
): Promise<any[]> => {
  return [];
};