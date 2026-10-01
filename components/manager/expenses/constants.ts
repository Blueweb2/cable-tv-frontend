export type ExpenseStatus = "Paid" | "Pending" | "Approved" | "Rejected";

export type PaymentMethod =
  | "Cash"
  | "Bank Transfer"
  | "UPI"
  | "Card"
  | "Petty Cash"
  | "Other";

export type ExpenseCategory =
  | "Fuel & Transit"
  | "Fiber & Cable Material"
  | "Connectors & Hardware"
  | "Node & Amplifier Spares"
  | "Tools & Safety Gear"
  | "Staff Allowance"
  | "Emergency Outage Food"
  | "Other";

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  event?: string;
  eventId?: string;
  zone?: string;
  zoneId?: string;
  zoneName?: string;
  duty?: string;
  date: string;
  paymentMethod: PaymentMethod;
  status: ExpenseStatus;
  description: string;
}

export const expenseCategories: ExpenseCategory[] = [
  "Fuel & Transit",
  "Fiber & Cable Material",
  "Connectors & Hardware",
  "Node & Amplifier Spares",
  "Tools & Safety Gear",
  "Staff Allowance",
  "Emergency Outage Food",
  "Other",
];

export const paymentMethods: PaymentMethod[] = [
  "UPI",
  "Cash",
  "Bank Transfer",
  "Card",
  "Petty Cash",
  "Other",
];

export const expenseStatuses: ExpenseStatus[] = [
  "Approved",
  "Pending",
  "Rejected",
  "Paid",
];

export const expenses: Expense[] = [
  {
    id: "EXP-001",
    title: "24-Core Armored Fiber Reel (500m)",
    category: "Fiber & Cable Material",
    amount: 18500,
    event: "North Sector FTTH",
    zoneName: "North Sector FTTH",
    date: "Sep 10, 2026",
    paymentMethod: "Bank Transfer",
    status: "Approved",
    description:
      "Replacement fiber spool for main trunk line repair after municipal road digging.",
  },
  {
    id: "EXP-002",
    title: "Fusion Splicer Electrode & Cleaver Blades",
    category: "Tools & Safety Gear",
    amount: 6200,
    event: "Central NOC Station",
    zoneName: "Central NOC Station",
    date: "Sep 11, 2026",
    paymentMethod: "UPI",
    status: "Approved",
    description:
      "Consumable spare electrodes for Fujikura 70S core alignment splicer.",
  },
  {
    id: "EXP-003",
    title: "Field Technician Bike Fuel Reimbursement",
    category: "Fuel & Transit",
    amount: 2400,
    event: "East Distribution Area",
    zoneName: "East Distribution Area",
    date: "Sep 14, 2026",
    paymentMethod: "Cash",
    status: "Approved",
    description:
      "Weekly transit allowance for 4 emergency linesman subscriber visits.",
  },
  {
    id: "EXP-004",
    title: "CAT6 Patch Cords & SC/APC Fast Connectors (100 pk)",
    category: "Connectors & Hardware",
    amount: 4800,
    event: "West Residential Zone",
    zoneName: "West Residential Zone",
    date: "Sep 17, 2026",
    paymentMethod: "UPI",
    status: "Pending",
    description:
      "Fast connectors and subscriber patch cords for FTTH drop activations.",
  },
  {
    id: "EXP-005",
    title: "Trunk Line Optical Node Power Supply 60V",
    category: "Node & Amplifier Spares",
    amount: 9500,
    event: "North Industrial Park",
    zoneName: "North Industrial Park",
    date: "Sep 16, 2026",
    paymentMethod: "Card",
    status: "Approved",
    description:
      "Ferroresonant outdoor power supply replacement after lightning surge.",
  },
  {
    id: "EXP-006",
    title: "Overtime Staff Allowance for Major Outage Restoration",
    category: "Staff Allowance",
    amount: 7500,
    event: "Highway Sector Outage",
    zoneName: "Highway Sector Outage",
    date: "Sep 19, 2026",
    paymentMethod: "Bank Transfer",
    status: "Pending",
    description:
      "Night shift emergency splice crew allowance for 6 linesmen.",
  },
  {
    id: "EXP-007",
    title: "Midnight Outage Crew Food & Water Supplies",
    category: "Emergency Outage Food",
    amount: 1800,
    event: "East Grid Breakdown",
    zoneName: "East Grid Breakdown",
    date: "Sep 20, 2026",
    paymentMethod: "UPI",
    status: "Approved",
    description:
      "Refreshments and water during all-night optical trunk restoration.",
  },
];

export const expenseStats = {
  total: expenses.length,
  totalAmount: expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  ),
  paidAmount: expenses
    .filter((expense) => expense.status === "Paid")
    .reduce((total, expense) => total + expense.amount, 0),
  pendingAmount: expenses
    .filter((expense) => expense.status === "Pending")
    .reduce((total, expense) => total + expense.amount, 0),
};