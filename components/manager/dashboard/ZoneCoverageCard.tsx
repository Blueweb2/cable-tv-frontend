"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Radio, Activity, CheckCircle, AlertTriangle, ChevronRight, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getZones } from "@/lib/zone.api";
import type { Zone } from "@/types/zone";

export default function ZoneCoverageCard() {
  const { token } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadZones() {
      if (!token) return;
      try {
        const res = await getZones(token, { limit: 5 });
        if (isMounted) {
          setZones(res.data || []);
        }
      } catch (err) {
        console.warn("Could not fetch zones:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadZones();
  }, [token]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/70 p-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="text-[#00d2ff]" size={20} />
            Network Zones & Distribution Sectors
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Active FTTH rings, coaxial nodes, and subscriber coverage
          </p>
        </div>

        <Link
          href="/manager/zones"
          className="text-xs font-semibold text-sky-400 hover:text-sky-300"
        >
          Manage All Zones →
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">
          Loading network coverage zones...
        </div>
      ) : zones.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">
          <p>No network zones configured yet.</p>
          <Link
            href="/manager/zones"
            className="mt-2 inline-block font-semibold text-sky-400 hover:underline"
          >
            Create first network zone →
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <div
              key={zone._id}
              className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 transition hover:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded bg-sky-500/10 px-1.5 py-0.5 text-[9px] font-bold text-sky-400 border border-sky-500/20">
                    {zone.code}
                  </span>
                  <h4 className="mt-1 font-bold text-xs text-white truncate max-w-[160px]">
                    {zone.name}
                  </h4>
                </div>

                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold ${
                    zone.status === "OPERATIONAL"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : zone.status === "MAINTENANCE"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {zone.status}
                </span>
              </div>

              <div className="mt-2.5 space-y-1 text-[11px] text-slate-400 border-t border-slate-800/60 pt-2">
                <div className="flex justify-between">
                  <span>Subscribers:</span>
                  <span className="font-semibold text-white">{zone.totalSubscribers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Distribution Nodes:</span>
                  <span className="font-semibold text-white">{zone.nodes?.length || 0} Nodes</span>
                </div>
                {zone.assignedLead && (
                  <div className="flex justify-between">
                    <span>Lead Tech:</span>
                    <span className="font-semibold text-sky-400 truncate max-w-[110px]">
                      {zone.assignedLead.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
