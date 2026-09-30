"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ManagerHeader from "./ManagerHeader";
import ManagerMenu from "./ManagerMenu";
import ManagerBottomNav from "./ManagerBottomNav";
import ManagerNotificationDrawer from "../notifications/ManagerNotificationDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useManagerNotifications } from "@/hooks/useManagerNotifications";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export default function ManagerLayout({
  children,
}: ManagerLayoutProps) {
  const router = useRouter();
  const { user, token, loading, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    loading: notifsLoading,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    refresh: refreshNotifs,
  } = useManagerNotifications();

  useEffect(() => {
    if (!loading) {
      if (!token) {
        router.push("/login");
        return;
      }
      const role = (user?.role || "").toLowerCase();
      if (role === "staff") {
        router.push("/staff");
      }
    }
  }, [loading, token, user, router]);

  const openMenu = () => {
    setIsMenuOpen(true);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading Cable Operations Control...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      {/* Header with Live Notifications Bell */}
      <ManagerHeader
        onMenuClick={openMenu}
        onNotificationClick={() => setIsNotifsOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Side Menu / Drawer */}
      <ManagerMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        onLogout={handleLogout}
      />

      {/* Slide-over Notifications Drawer */}
      <ManagerNotificationDrawer
        open={isNotifsOpen}
        onClose={() => setIsNotifsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={notifsLoading}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDismiss={dismissNotification}
        onRefresh={refreshNotifs}
      />

      {/* Page Content */}
      <main className="min-h-[calc(100vh-64px)] pb-20 flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <ManagerBottomNav onMenuClick={openMenu} />
    </div>
  );
}