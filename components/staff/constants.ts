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
    id: "EVT-1048",
    title: "Annual Corporate Gala 2026",
    type: "Corporate",
    date: "18 Dec 2026",
    time: "6:00 PM - 11:00 PM",
    location: "The Grand Hyatt",
    role: "Lead Technician",
    manager: "Sarah Jenkins",
    status: "Confirmed",
  },
  {
    id: "EVT-1047",
    title: "Royal Palace Wedding Reception",
    type: "Wedding",
    date: "20 Dec 2026",
    time: "5:30 PM - 11:30 PM",
    location: "Royal Palace Grounds",
    role: "Guest Coordination",
    manager: "Marcus Vance",
    status: "Confirmed",
  },
  {
    id: "EVT-1046",
    title: "Tech Convention Product Launch",
    type: "Conference",
    date: "22 Dec 2026",
    time: "8:30 AM - 4:00 PM",
    location: "Tech Convention Center",
    role: "Floor Operations",
    manager: "Elena Rostova",
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
    eventName: "Inventory & Equipment Check",
    location: "Central Warehouse",
    status: "Completed",
  },
  {
    id: "SCH-2",
    day: "Wed",
    date: "17 Dec",
    shift: "02:00 PM - 08:00 PM",
    eventName: "Rehearsal & Rigging",
    location: "The Grand Hyatt",
    status: "Completed",
  },
  {
    id: "SCH-3",
    day: "Fri",
    date: "18 Dec",
    shift: "04:00 PM - 11:30 PM",
    eventName: "Corporate Gala Live Event",
    location: "The Grand Hyatt",
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
    checkIn: "01:55 PM",
    checkOut: "08:05 PM",
    hours: "6h 10m",
    status: "Present",
  },
  {
    id: "ATT-2",
    date: "15 Dec 2026",
    checkIn: "09:02 AM",
    checkOut: "05:00 PM",
    hours: "7h 58m",
    status: "Present",
  },
  {
    id: "ATT-3",
    date: "12 Dec 2026",
    checkIn: "10:15 AM",
    checkOut: "06:00 PM",
    hours: "7h 45m",
    status: "Late",
  },
];

export const currentStaff = {
  id: "STF-001",
  name: "Arun Kumar",
  email: "staff@eventmanagement.com",
  role: "staff",
  employmentType: "Part-Time",
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
