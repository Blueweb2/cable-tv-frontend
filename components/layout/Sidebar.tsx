"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Radio,
  Clock,
  CalendarDays,
  Wallet,
  IndianRupee,
  BarChart3,
  Settings,
  LogOut,
  X,
  User,
  Activity,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

interface SidebarProps {
  role?: "manager" | "staff";
  isOpen?: boolean;
  onClose?: () => void;
}

const managerItems: SidebarItem[] = [
  {
    label: "Command Center",
    href: "/manager",
    icon: LayoutDashboard,
  },
  {
    label: "Field Jobs & Duties",
    href: "/manager/duties",
    icon: ClipboardList,
  },
  {
    label: "Staff & Technicians",
    href: "/manager/staff",
    icon: Users,
  },
  {
    label: "Zones & Nodes",
    href: "/manager/zones",
    icon: Radio,
  },
  {
    label: "Live Attendance & Shifts",
    href: "/manager/attendance",
    icon: Clock,
  },
  {
    label: "Staff Rosters & Leaves",
    href: "/manager/availability",
    icon: CalendarDays,
  },
  {
    label: "Field Expenses & Claims",
    href: "/manager/expenses",
    icon: Wallet,
  },
  {
    label: "Payroll & Hourly Wages",
    href: "/manager/payroll",
    icon: IndianRupee,
  },
  {
    label: "Network & Staff Reports",
    href: "/manager/reports",
    icon: BarChart3,
  },
  {
    label: "Settings",
    href: "/manager/settings",
    icon: Settings,
  },
];

const staffItems: SidebarItem[] = [
  {
    label: "Technician Dashboard",
    href: "/staff",
    icon: LayoutDashboard,
  },
  {
    label: "My Work Orders & Duties",
    href: "/staff/duties",
    icon: ClipboardList,
  },
  {
    label: "Punch Clock & Shifts",
    href: "/staff/attendance",
    icon: Clock,
  },
  {
    label: "My Availability",
    href: "/staff/availability",
    icon: CalendarDays,
  },
  {
    label: "Technician Profile",
    href: "/staff/profile",
    icon: User,
  },
];

export default function Sidebar({
  role = "manager",
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const items = role === "manager" ? managerItems : staffItems;
  const dashboardHref = role === "manager" ? "/manager" : "/staff";

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed left-0 top-0 z-50",
          "flex h-screen w-64 flex-col",
          "border-r border-[var(--navy-border)]",
          "bg-[#090d16]",
          "shadow-2xl shadow-black/50",
          "transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo Header */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--navy-border)] px-5">
          <Link
            href={dashboardHref}
            onClick={onClose}
            className="flex items-center gap-2.5 group"
            aria-label="Cable Operator Staff Portal"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#00d2ff] text-white shadow-md shadow-sky-500/20">
              <Radio size={20} />
            </div>

            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white text-base">
                Cable<span className="text-[#00d2ff]">Ops</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {role === "manager" ? "Manager Control" : "Technician Portal"}
              </span>
            </div>
          </Link>

          {/* Mobile Close */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div className="border-b border-[var(--navy-border)] bg-[#0f172a]/60 px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                {user?.name || "Staff Member"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="truncate text-[10px] text-slate-400 capitalize">
                  {user?.department || (role === "manager" ? "Operations Manager" : "Field Technician")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto px-3 py-4 space-y-1"
          aria-label={`${role} navigation`}
        >
          <div className="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Operations Menu
          </div>

          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/manager" && item.href !== "/staff" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-sky-600/30 to-cyan-600/20 text-sky-300 border border-sky-500/30 shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
                ].join(" ")}
              >
                <Icon
                  size={18}
                  className={[
                    "shrink-0 transition-colors",
                    isActive
                      ? "text-[#00d2ff]"
                      : "text-slate-400 group-hover:text-slate-200",
                  ].join(" ")}
                />
                <span className="flex-1 truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-[var(--navy-border)] bg-[#0f172a]/60 p-3">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-red-400 transition-colors hover:bg-red-950/40 hover:text-red-300"
          >
            <LogOut size={17} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}