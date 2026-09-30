"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  X,
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
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ManagerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

const menuItems = [
  {
    label: "Command Center",
    href: "/manager",
    icon: LayoutDashboard,
    badge: "Live",
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

export default function ManagerMenu({
  isOpen,
  onClose,
  onLogout,
}: ManagerMenuProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background Overlay */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Drawer */}
      <aside
        className="relative flex h-full w-[85%] max-w-sm flex-col bg-[#0b1120] border-r border-[var(--navy-border)] shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Manager navigation menu"
      >
        {/* Header */}
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-slate-800 px-5 bg-[#0f172a]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 font-bold text-white shadow-md">
              {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                {user?.name || "Manager"}
              </p>
              <p className="truncate text-xs text-sky-400">
                Network Operations Control
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Operations & Field Hub
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/manager"
                  ? pathname === "/manager"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={[
                    "flex min-h-11 items-center gap-3 rounded-xl px-3 text-xs font-semibold transition",
                    isActive
                      ? "bg-gradient-to-r from-sky-600/30 to-cyan-600/20 text-sky-300 border border-sky-500/30 shadow-sm"
                      : "text-slate-300 hover:bg-slate-800/60 hover:text-white",
                  ].join(" ")}
                >
                  <Icon
                    size={18}
                    className={isActive ? "text-[#00d2ff]" : "text-slate-400"}
                  />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.badge && (
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight
                    size={15}
                    className={isActive ? "text-sky-400" : "text-slate-600"}
                  />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="shrink-0 border-t border-slate-800 p-4 bg-[#0f172a]/60">
          <button
            type="button"
            onClick={onLogout}
            className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-xs font-semibold text-red-400 transition hover:bg-red-950/40 hover:text-red-300"
          >
            <LogOut size={18} />
            <span className="flex-1 text-left">Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
}