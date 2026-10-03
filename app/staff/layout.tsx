"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import StaffBottomNav from "@/components/staff/StaffBottomNav";
import StaffMoreMenu from "@/components/staff/StaffMoreMenu";
import { useAuth } from "@/hooks/useAuth";

interface StaffLayoutProps {
  children: ReactNode;
}

export default function StaffLayout({
  children,
}: StaffLayoutProps) {
  const router = useRouter();
  const { token, loading } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!loading && !token) {
      router.push("/login");
    }
  }, [loading, token, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090d16]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Loading Staff Portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <div className="mx-auto min-h-screen w-full max-w-7xl px-3.5 sm:px-6 lg:px-8 pb-28 sm:pb-24 lg:pb-8">
        {children}
      </div>

      <StaffBottomNav
        onMore={() => setMoreOpen(true)}
      />

      <StaffMoreMenu
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
      />
    </div>
  );
}