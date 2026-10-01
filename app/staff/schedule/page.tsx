"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function StaffScheduleRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/staff/duties");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-950/40 text-cyan-400">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-xs font-medium text-slate-400">Redirecting to My Shifts...</p>
    </div>
  );
}