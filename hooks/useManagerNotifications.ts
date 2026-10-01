"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getExpenses } from "@/lib/expense.api";
import { getAssignments } from "@/lib/assignment.api";
import { useAuth } from "@/hooks/useAuth";

export type NotificationCategory = "ACTION" | "DUTY" | "FINANCE" | "OUTAGE" | "STAFF";

export interface ManagerNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  timeAgo: string;
  link: string;
  read: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
}

const STORAGE_KEY = "cableops_manager_read_notifs";
const DISMISSED_KEY = "cableops_manager_dismissed_notifs";

export function useManagerNotifications() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(DISMISSED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [rawNotifications, setRawNotifications] = useState<ManagerNotification[]>([]);

  const fetchLiveNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);

      const [expensesRes, assignmentsRes] = await Promise.allSettled([
        getExpenses(),
        getAssignments(token, { limit: 50 }),
      ]);

      const items: ManagerNotification[] = [];

      // 1. Staff Shift Rejections & Pending Duty Confirmations & Critical Outages
      if (assignmentsRes.status === "fulfilled" && assignmentsRes.value?.data) {
        assignmentsRes.value.data.forEach((duty) => {
          const staffName = typeof duty.staff === "object" ? duty.staff.name : "Technician";
          const zoneName = duty.zoneName || "Field Zone";

          // Critical Outage Alert
          if (duty.priority === "CRITICAL_OUTAGE" && duty.status !== "COMPLETED") {
            items.push({
              id: `outage-alert-${duty._id}`,
              category: "OUTAGE",
              title: `⚡ CRITICAL OUTAGE: ${duty.dutyTitle}`,
              message: `${zoneName}: Immediate technician attention required. Status is currently ${duty.status.replace("_", " ")}.`,
              timestamp: duty.dutyDate || duty.createdAt,
              timeAgo: "Urgent",
              link: `/manager/duties`,
              read: false,
              priority: "HIGH",
            });
          }

          // Technician Declined Shift
          if (duty.status === "REJECTED") {
            items.push({
              id: `duty-rejected-${duty._id}`,
              category: "STAFF",
              title: `🚨 Shift Declined: ${staffName}`,
              message: `${staffName} declined "${duty.dutyTitle}" (${zoneName}). Reason: "${duty.rejectionReason || "Unavailable"}". Click to reassign.`,
              timestamp: duty.respondedAt || duty.updatedAt || duty.dutyDate,
              timeAgo: "Action Required",
              link: `/manager/duties`,
              read: false,
              priority: "HIGH",
            });
          } else if (duty.status === "ASSIGNED") {
            // Awaiting confirmation
            items.push({
              id: `duty-pending-${duty._id}`,
              category: "DUTY",
              title: `⏳ Pending Confirmation: ${staffName}`,
              message: `Awaiting shift acceptance from ${staffName} for "${duty.dutyTitle}" (${zoneName}).`,
              timestamp: duty.createdAt || duty.dutyDate,
              timeAgo: "Pending Response",
              link: `/manager/duties`,
              read: false,
              priority: "MEDIUM",
            });
          }
        });
      }

      // 2. Pending Expenses Needing Manager Approval
      if (expensesRes.status === "fulfilled" && Array.isArray(expensesRes.value)) {
        const pendingExpenses = expensesRes.value.filter((exp) => exp.status === "Pending");
        pendingExpenses.slice(0, 5).forEach((exp) => {
          items.push({
            id: `exp-pending-${exp.id}`,
            category: "FINANCE",
            title: `Pending Expense: ₹${exp.amount.toLocaleString("en-IN")}`,
            message: `Claim for "${exp.title}" (${exp.category}) is awaiting manager review.`,
            timestamp: exp.date,
            timeAgo: "Awaiting Action",
            link: `/manager/expenses`,
            read: false,
            priority: exp.amount > 10000 ? "HIGH" : "MEDIUM",
          });
        });
      }

      // Fallback notification if clear
      if (items.length === 0) {
        items.push({
          id: "sys-ready-1",
          category: "ACTION",
          title: "All Field Operations Running Smoothly",
          message: "No pending alerts, outages, or unassigned duties. Network operations are fully up to date.",
          timestamp: new Date().toISOString(),
          timeAgo: "Just now",
          link: "/manager",
          read: true,
          priority: "LOW",
        });
      }

      setRawNotifications(items);
    } catch {
      // Keep existing notifications
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchLiveNotifications]);

  // Combine with read & dismissed states
  const notifications = useMemo(() => {
    return rawNotifications
      .filter((n) => !dismissedIds.includes(n.id))
      .map((n) => ({
        ...n,
        read: n.read || readIds.includes(n.id),
      }));
  }, [rawNotifications, readIds, dismissedIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadIds(allIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allIds));
    } catch {}
  }, [notifications]);

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds((prev) => {
      const updated = [...prev, id];
      try {
        localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearAllNotifications = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setDismissedIds(allIds);
    try {
      localStorage.setItem(DISMISSED_KEY, JSON.stringify(allIds));
    } catch {}
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    clearAllNotifications,
    refresh: fetchLiveNotifications,
  };
}
