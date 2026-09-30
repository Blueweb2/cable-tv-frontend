"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Clock3,
  MapPin,
  Radio,
  Navigation,
  Camera,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { Assignment } from "@/types/assignment";
import { formatTime24to12 } from "@/lib/duty-mapper";
import SitePhotosUploadModal from "./SitePhotosUploadModal";
import SitePhotosGallery from "./SitePhotosGallery";
import { useAuth } from "@/hooks/useAuth";

interface TodayDutiesProps {
  assignments: Assignment[];
  onUpdate?: () => void;
}

export default function TodayDuties({
  assignments,
  onUpdate,
}: TodayDutiesProps) {
  const { token } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const duties = assignments
    .filter((item) => item.dutyDate.slice(0, 10) === today)
    .slice(0, 5);

  const [activePhotoDuty, setActivePhotoDuty] = useState<Assignment | null>(null);

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "CRITICAL_OUTAGE":
        return (
          <span className="flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-400">
            <AlertTriangle size={11} /> CRITICAL
          </span>
        );
      case "HIGH":
        return (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400">
            HIGH
          </span>
        );
      default:
        return (
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold text-sky-400">
            STANDARD
          </span>
        );
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/80 p-4 sm:p-5 shadow-xl text-slate-100">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Radio className="text-[#00d2ff]" size={18} />
            Today&apos;s Field Work Orders
          </h2>
          <p className="text-xs text-slate-400">Line maintenance, subscriber repairs & fiber splices</p>
        </div>
        <Link
          href="/staff/duties"
          className="text-xs font-semibold text-sky-400 hover:text-sky-300"
        >
          View All ({assignments.length}) →
        </Link>
      </div>

      {duties.length === 0 ? (
        <div className="mt-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 p-6 text-xs text-slate-400 text-center">
          No work orders scheduled for today. You are currently on standby.
        </div>
      ) : (
        <div className="mt-3.5 space-y-3">
          {duties.map((duty) => {
            const mapsUrl =
              duty.siteLocation?.googleMapsUrl ||
              (duty.location
                ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(duty.location)}`
                : null);

            return (
              <div
                key={duty._id}
                className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 transition hover:border-slate-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-white break-words">
                        {duty.dutyTitle}
                      </span>
                      {getPriorityBadge(duty.priority)}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      {duty.zoneName && (
                        <span className="text-sky-400 font-semibold">{duty.zoneName}</span>
                      )}
                      {duty.nodeNumber && (
                        <span className="text-cyan-400 font-mono">({duty.nodeNumber})</span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      duty.status === "IN_PROGRESS"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : duty.status === "COMPLETED"
                        ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {duty.status.replace("_", " ")}
                  </span>
                </div>

                {/* Problem fault details snippet */}
                {duty.problemDetails?.faultDescription && (
                  <p className="text-xs text-amber-200/90 rounded-lg bg-amber-950/20 border border-amber-500/20 p-2">
                    ⚠️ {duty.problemDetails.faultDescription}
                  </p>
                )}

                {/* Details bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Clock3 size={12} className="text-sky-400" />
                      {formatTime24to12(duty.startTime)} - {formatTime24to12(duty.endTime)}
                    </span>
                    {duty.location && (
                      <span className="flex items-center gap-1 truncate max-w-[140px]">
                        <MapPin size={12} className="text-emerald-400" />
                        {duty.location}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {mapsUrl && (
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-semibold text-sky-400 hover:bg-slate-700 hover:text-white"
                      >
                        <Navigation size={11} />
                        <span>Maps</span>
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => setActivePhotoDuty(duty)}
                      className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-sky-600 to-cyan-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm hover:from-sky-500 hover:to-cyan-500"
                    >
                      <Camera size={12} />
                      <span>Site Photo ({duty.sitePhotos?.length || 0})</span>
                    </button>
                  </div>
                </div>

                {/* Photo thumbnails if existing */}
                {duty.sitePhotos && duty.sitePhotos.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/60">
                    <SitePhotosGallery photos={duty.sitePhotos} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Upload Modal */}
      {activePhotoDuty && token && (
        <SitePhotosUploadModal
          isOpen={Boolean(activePhotoDuty)}
          onClose={() => setActivePhotoDuty(null)}
          duty={activePhotoDuty}
          token={token}
          onPhotoUploaded={(updatedDuty) => {
            setActivePhotoDuty(null);
            if (onUpdate) onUpdate();
          }}
        />
      )}
    </section>
  );
}
