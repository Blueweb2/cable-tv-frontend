export type AttendanceStatus =
  | "PRESENT"
  | "LATE"
  | "HALF_DAY"
  | "ABSENT"
  | "ON_LEAVE";

export type AttendanceStaff = {
  _id: string;
  name: string;
  username: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  location?: string;
};

export type AttendanceDuty = {
  _id: string;
  dutyTitle: string;
  role?: string;
  dutyDate?: string;
  startTime: string;
  endTime: string;
  status?: string;
  jobType?: string;
  priority?: string;
  zoneName?: string;
};

export type AttendanceMarkedBy = {
  _id: string;
  name: string;
  username: string;
};

export type Attendance = {
  _id: string;
  duty?: string | AttendanceDuty | null;
  staff: string | AttendanceStaff;
  zone?: string | any | null;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: AttendanceStatus;
  isPaused?: boolean;
  pausedAt?: string | null;
  totalPauseMinutes?: number;
  activeMinutes?: number;
  totalHours?: number;
  locationCheckIn?: string;
  locationCheckOut?: string;
  sessions?: Array<{
    type: "CLOCK_IN" | "PAUSE" | "RESUME" | "CLOCK_OUT";
    timestamp: string;
    reason?: string;
    notes?: string;
  }>;
  pauseHistory?: Array<{
    pausedAt: string;
    resumedAt?: string;
    durationMinutes?: number;
    reason?: string;
  }>;
  notes: string;
  markedBy: string | AttendanceMarkedBy | null;
  // Optional backward compatibility
  event?: any;
  createdAt: string;
  updatedAt: string;
};

export type PauseShiftPayload = {
  duty?: string;
  dutyId?: string;
  reason?: string;
  notes?: string;
};

export type ResumeShiftPayload = {
  duty?: string;
  dutyId?: string;
  notes?: string;
};

export type CheckInPayload = {
  duty?: string;
  dutyId?: string;
  zone?: string;
  location?: string;
  locationCheckIn?: string;
  notes?: string;
  staff?: string;
};

export type CheckOutPayload = {
  duty?: string;
  dutyId?: string;
  location?: string;
  locationCheckOut?: string;
  notes?: string;
  staff?: string;
};


export type MarkAbsentPayload = {
  duty?: string;
  staff?: string;
  notes?: string;
};

export type AttendanceFilters = {
  staff?: string;
  zone?: string;
  duty?: string;
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus | "ALL";
  page?: number;
  limit?: number;
  event?: string;
};

export type AttendancePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type AttendanceListResponse = {
  success: boolean;
  data: Attendance[];
  pagination: AttendancePagination;
};

export type AttendanceResponse = {
  success: boolean;
  message?: string;
  data: {
    attendance: Attendance;
  };
};

export type UpdateAttendancePayload = {
  checkIn?: string | null;
  checkOut?: string | null;
  status?: AttendanceStatus;
  notes?: string;
};