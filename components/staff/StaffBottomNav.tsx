"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Clock3,
  User,
  Menu,
} from "lucide-react";

interface StaffBottomNavProps {
  onMore?: () => void;
}

export default function StaffBottomNav({ onMore }: StaffBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/staff", icon: LayoutDashboard },
    { label: "Shifts", href: "/staff/duties", icon: ClipboardList },
    { label: "Attendance", href: "/staff/attendance", icon: Clock3 },
    { label: "Profile", href: "/staff/profile", icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-[#090d16]/95 backdrop-blur-lg lg:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/staff"
              ? pathname === "/staff"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] font-semibold transition active:scale-95 ${
                isActive
                  ? "text-[#00d2ff]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span
                className={`flex h-8 w-10 items-center justify-center rounded-xl transition ${
                  isActive ? "bg-sky-500/15 border border-sky-500/30 shadow-sm" : ""
                }`}
              >
                <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}

        {onMore && (
          <button
            type="button"
            onClick={onMore}
            className="flex min-w-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] font-semibold text-slate-400 transition hover:text-slate-200 active:scale-95 cursor-pointer"
          >
            <span className="flex h-8 w-10 items-center justify-center rounded-xl">
              <Menu size={20} strokeWidth={1.8} />
            </span>
            <span>More</span>
          </button>
        )}
      </div>
    </nav>
  );
}
