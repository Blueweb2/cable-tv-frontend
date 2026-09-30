"use client";

import { Bell, Menu, Radio, Activity } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

interface ManagerHeaderProps {
  title?: string;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  unreadCount?: number;
}

export default function ManagerHeader({
  title = "Operations Hub",
  onMenuClick,
  onNotificationClick,
  unreadCount = 0,
}: ManagerHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--navy-border)] bg-[#090d16]/90 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Menu & Brand Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <Menu size={19} />
          </button>

          <Link href="/manager" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-sm">
              <Radio size={16} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">CableOps</span>
                <span className="hidden sm:inline-block rounded bg-sky-500/10 px-1.5 py-0.2 text-[9px] font-bold text-sky-400 border border-sky-500/20">
                  NOC
                </span>
              </div>
              <p className="hidden sm:block text-[10px] text-slate-400 font-medium">{title}</p>
            </div>
          </Link>
        </div>

        {/* Center: Live Status Indicator */}
        <div className="hidden md:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Network Online • All Nodes Monitored</span>
        </div>

        {/* Right: Notification & User Profile */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onNotificationClick}
            aria-label={`Notifications (${unreadCount} unread)`}
            title={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-extrabold text-white ring-2 ring-[#090d16]">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-600 font-bold text-xs text-white">
              {user?.name ? user.name.charAt(0).toUpperCase() : "M"}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[120px]">{user?.name || "Manager"}</p>
              <p className="text-[10px] text-sky-400 font-medium">Ops Dispatcher</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}