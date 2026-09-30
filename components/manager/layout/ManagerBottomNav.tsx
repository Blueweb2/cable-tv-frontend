"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Radio,
  MoreHorizontal,
} from "lucide-react";

interface ManagerBottomNavProps {
  onMenuClick?: () => void;
}

const navigationItems = [
  {
    label: "Hub",
    href: "/manager",
    icon: LayoutDashboard,
  },
  {
    label: "Duties",
    href: "/manager/duties",
    icon: ClipboardList,
  },
  {
    label: "Zones",
    href: "/manager/zones",
    icon: Radio,
  },
  {
    label: "Staff",
    href: "/manager/staff",
    icon: Users,
  },
];

export default function ManagerBottomNav({
  onMenuClick,
}: ManagerBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--navy-border)] bg-[#090d16]/95 backdrop-blur-lg md:hidden"
      aria-label="Manager bottom navigation"
    >
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            item.href === "/manager"
              ? pathname === "/manager"
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
              aria-current={isActive ? "page" : undefined}
            >
              <span
                className={`flex h-8 w-10 items-center justify-center rounded-xl transition ${
                  isActive ? "bg-sky-500/15 border border-sky-500/30 shadow-sm" : ""
                }`}
              >
                <Icon
                  size={19}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
              </span>

              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* More / Menu */}
        <button
          type="button"
          onClick={onMenuClick}
          className="flex min-w-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1 text-[11px] font-semibold text-slate-400 transition hover:text-slate-200 active:scale-95"
          aria-label="Open more menu"
        >
          <span className="flex h-8 w-10 items-center justify-center rounded-xl">
            <MoreHorizontal size={20} strokeWidth={1.8} />
          </span>

          <span>More</span>
        </button>
      </div>
    </nav>
  );
}
