import { api } from "./api";

export type DashboardAnalytics = {
  totalStaff: number;
  activeShifts: number;
  totalDutiesToday: number;
  inProgressDuties: number;
  completedDuties: number;
  criticalOutages: number;
  totalStaffHours: number;
  totalZones: number;
  operationalZones: number;
  totalExpenses: number;
  jobTypeBreakdown: Array<{ _id: string; count: number }>;
};

export type AnalyticsResponse = {
  success: boolean;
  data: DashboardAnalytics;
};

/**
 * Fetch dashboard analytics
 */
export async function getDashboardAnalytics(
  token: string
): Promise<DashboardAnalytics> {
  const result = await api<AnalyticsResponse>("/reports/analytics", {
    token,
  });

  return result.data;
}
