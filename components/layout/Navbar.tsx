"use client";

import Link from "next/link";
import { Radio, LogIn, ShieldCheck, Activity, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--navy-border)] bg-[#090d16]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
          aria-label="CableOps Staff Management Portal"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#0284c7] to-[#00d2ff] text-white shadow-lg shadow-sky-500/25 transition-transform group-hover:scale-105">
            <Radio size={22} className="animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-white">
                Cable<span className="text-[#00d2ff]">Ops</span>
              </span>
              <span className="rounded-full bg-sky-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-sky-400 border border-sky-500/20">
                PORTAL
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400">
              Staff & Field Network Management
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Main navigation">
          {isAuthenticated ? (
            <>
              {user?.role === "admin" || user?.role === "manager" ? (
                <Link
                  href="/manager"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <Activity size={16} className="text-[#00d2ff]" />
                  Command Center
                </Link>
              ) : (
                <Link
                  href="/staff"
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  <Activity size={16} className="text-[#00d2ff]" />
                  Technician Dashboard
                </Link>
              )}
            </>
          ) : null}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">{user?.name}</span>
                <span className="text-[10px] text-sky-400 uppercase tracking-wider">{user?.role}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-red-950/40 hover:text-red-400 hover:border-red-800/50"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-sky-500/20 transition hover:from-sky-500 hover:to-cyan-500"
            >
              <LogIn size={16} />
              Staff Login
            </Link>
          )}

          {/* Mobile menu button */}
          {onMenuClick && (
            <button
              type="button"
              onClick={onMenuClick}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}