"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  X,
  UserCheck,
  CalendarDays,
  UserCircle,
  LogOut,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface StaffMoreMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function StaffMoreMenu({ open, onClose }: StaffMoreMenuProps) {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!open) return null;

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/login");
  };

  const moreItems = [
    { label: "My Attendance", href: "/staff/attendance", icon: UserCheck },
    { label: "My Availability", href: "/staff/availability", icon: CalendarDays },
    { label: "Staff Profile", href: "/staff/profile", icon: UserCircle },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="flex h-full w-[80%] max-w-xs flex-col bg-[#0f172a] border-l border-slate-800 p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 font-bold text-white shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : "S"}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{user?.name || "Staff Member"}</p>
              <p className="text-xs text-slate-400">{user?.email || "staff"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-1">
          {moreItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800/50 hover:text-sky-400"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
