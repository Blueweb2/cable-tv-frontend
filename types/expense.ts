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
  _id?: string;
  id: string;
  title: string;
  category: ExpenseCategory | string;
  amount: number;
  event?: string;
  eventId?: string;
  zone?: string;
  zoneId?: string;
  zoneName?: string;
  duty?: string;
  date: string;
  paymentMethod: PaymentMethod | string;
  status: ExpenseStatus | string;
  description?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
