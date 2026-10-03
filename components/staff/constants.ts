export type DutyStatus = "Pending" | "In Progress" | "Completed";

export interface StaffDuty {
  id: string;
  title: string;
  zoneName?: string;
  eventName?: string;
  event?: string;
  date: string;
  eventDate?: string;
  time: string;
  eventTime?: string;
  location: string;
  role: string;
  status: DutyStatus;
  priority: "High" | "Medium" | "Low";
  description: string;
}

export const staffDuties: StaffDuty[] = [
  {
    id: "DUTY-001",
    title: "Fiber Backbone Splice & OTDR Test",
    zoneName: "North Sector FTTH (Z-NORTH)",
    eventName: "North Sector FTTH",
    event: "North Sector FTTH",
    date: "18 Dec 2026",
    eventDate: "18 Dec 2026",
    time: "9:00 AM - 1:00 PM",
    eventTime: "9:00 AM - 1:00 PM",
    location: "Pole 42, North Main Road",
    role: "Fiber Splicing Technician",
    status: "In Progress",
    priority: "High",
    description: "Repair severed 12-core drop cable and verify optical attenuation is below -19 dBm.",
  },
  {
    id: "DUTY-002",
    title: "Subscriber ONT & Router Setup",
    zoneName: "East Distribution Area (Z-EAST)",
    eventName: "East Distribution Area",
    event: "East Distribution Area",
    date: "20 Dec 2026",
    eventDate: "20 Dec 2026",
    time: "2:00 PM - 4:00 PM",
    eventTime: "2:00 PM - 4:00 PM",
    location: "Flat 4B, Sunrise Heights",
    role: "Installation Technician",
    status: "Pending",
    priority: "Medium",
    description: "Install dual-band WiFi ONT, configure PPPoE credentials, and verify TV STB provisioning.",
  },
  {
    id: "DUTY-003",
    title: "Node 14 Amplifier Power Inspection",
    zoneName: "Central Grid Station (Z-CENTRAL)",
    eventName: "Central Grid Station",
    date: "22 Dec 2026",
    time: "10:00 AM - 12:00 PM",
    location: "Substation Box 14, Market Road",
    role: "Line Maintenance Engineer",
    status: "Pending",
    priority: "Medium",
    description: "Check RF signal input/output levels and replace worn coax connectors on trunk line.",
  },
];

export interface StaffEvent {
  id: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  role: string;
  manager: string;
  status: "Confirmed" | "Upcoming" | "Completed";
}

export const staffEvents: StaffEvent[] = [
  {
    id: "DUTY-1048",
    title: "FTTH Optical Power Calibration & Splicing",
    type: "Fiber Maintenance",
    date: "18 Dec 2026",
    time: "09:00 AM - 01:00 PM",
    location: "North Sector FTTH Hub",
    role: "Fiber Technician",
    manager: "Admin Manager",
    status: "Confirmed",
  },
  {
    id: "DUTY-1047",
    title: "Trunk Coax Line Repair & Tap Replacement",
    type: "Line Repair",
    date: "20 Dec 2026",
    time: "10:30 AM - 02:30 PM",
    location: "East Distribution Area",
    role: "Linesman",
    manager: "Admin Manager",
    status: "Confirmed",
  },
  {
    id: "DUTY-1046",
    title: "Dual Band ONT & STB Activation",
    type: "New Installation",
    date: "22 Dec 2026",
    time: "02:00 PM - 04:30 PM",
    location: "Financial Heights, Mall Road",
    role: "Installation Technician",
    manager: "Admin Manager",
    status: "Upcoming",
  },
];

export interface ScheduleItem {
  id: string;
  day: string;
  date: string;
  shift: string;
  eventName: string;
  location: string;
  status: "Scheduled" | "Completed" | "Off";
}

export const staffSchedule: ScheduleItem[] = [
  {
    id: "SCH-1",
    day: "Mon",
    date: "15 Dec",
    shift: "09:00 AM - 05:00 PM",
    eventName: "Fiber Backbone Integrity Check",
    location: "Central NOC Station",
    status: "Completed",
  },
  {
    id: "SCH-2",
    day: "Wed",
    date: "17 Dec",
    shift: "10:00 AM - 04:00 PM",
    eventName: "Node Amplifier Maintenance",
    location: "North Sector Hub",
    status: "Completed",
  },
  {
    id: "SCH-3",
    day: "Fri",
    date: "18 Dec",
    shift: "09:00 AM - 01:00 PM",
    eventName: "Emergency FTTH Splicing Duty",
    location: "North Main Road, Pole 42",
    status: "Scheduled",
  },
];

export interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  duration?: string;
  hours: string;
  eventName?: string;
  status: "Present" | "Absent" | "Late";
}

export const attendanceRecords: AttendanceRecord[] = [
  {
    id: "ATT-1",
    date: "17 Dec 2026",
    checkIn: "09:00 AM",
    checkOut: "05:10 PM",
    hours: "8h 10m",
    status: "Present",
  },
  {
    id: "ATT-2",
    date: "15 Dec 2026",
    checkIn: "08:58 AM",
    checkOut: "05:00 PM",
    hours: "8h 02m",
    status: "Present",
  },
  {
    id: "ATT-3",
    date: "12 Dec 2026",
    checkIn: "09:45 AM",
    checkOut: "06:00 PM",
    hours: "8h 15m",
    status: "Late",
  },
];

export const currentStaff = {
  id: "STF-001",
  name: "Arun Kumar",
  email: "arun@cableops.com",
  role: "staff",
  specialization: "Linesman",
  employmentType: "Full-Time",
};

export interface LeaveRequest {
  id: string;
  fromDate: string;
  toDate: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  type?: string;
}

export const leaveRequests: LeaveRequest[] = [
  {
    id: "LEV-1",
    fromDate: "2026-12-24",
    toDate: "2026-12-26",
    reason: "Family holiday commitment",
    status: "Approved",
    type: "Personal Leave",
  },
  {
    id: "LEV-2",
    fromDate: "2026-12-31",
    toDate: "2027-01-01",
    reason: "New Year celebration",
    status: "Pending",
    type: "Casual Leave",
  },
];
