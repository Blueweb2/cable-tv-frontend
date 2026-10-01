"use client";

import {
  MapPin,
  Navigation,
  Radio,
  AlertTriangle,
  Phone,
  User,
  Zap,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import type { Assignment, SiteLocation, ProblemDetails, JobType, SubscriberInfo } from "@/types/assignment";

interface SiteLocationCardProps {
  duty?: Assignment;
  location?: SiteLocation;
  problem?: ProblemDetails;
  jobType?: JobType;
  subscriber?: SubscriberInfo;
}

export default function SiteLocationCard({
  duty,
  location: propLocation,
  problem: propProblem,
  jobType: propJobType,
  subscriber: propSubscriber,
}: SiteLocationCardProps) {
  const site = propLocation || duty?.siteLocation;
  const problem = propProblem || duty?.problemDetails;
  const subscriber = propSubscriber || duty?.subscriber;
  const rawLocation = duty?.location || site?.address;

  // Build Google Maps Link
  const mapsUrl =
    site?.googleMapsUrl ||
    (site?.coordinates?.lat && site?.coordinates?.lng
      ? `https://www.google.com/maps?q=${site.coordinates.lat},${site.coordinates.lng}`
      : site?.address || rawLocation
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          site?.address || rawLocation || ""
        )}`
      : null);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-4 sm:p-5 shadow-xl space-y-4 text-slate-100">
      {/* Header with Navigation Link */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/15 text-[#00d2ff]">
              <MapPin size={16} />
            </span>
            <h3 className="text-sm font-bold text-white">Job Site & Problem Diagnostics</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exact field location, pole specifications & fault breakdown
          </p>
        </div>

        {mapsUrl && (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-sky-500/25 transition hover:from-sky-500 hover:to-cyan-500 active:scale-95"
          >
            <Navigation size={14} className="animate-pulse" />
            <span>Open in Google Maps</span>
            <ExternalLink size={12} className="opacity-70" />
          </a>
        )}
      </div>

      {/* Problem Diagnostics Alert Box */}
      {problem?.faultDescription && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <AlertTriangle size={15} />
              Fault Diagnostic: {problem.issueCategory || "Network Issue"}
            </span>
            {problem.affectedSubscribersCount ? (
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                {problem.affectedSubscribersCount} Subscribers Impacted
              </span>
            ) : null}
          </div>

          <p className="text-xs text-amber-100/90 leading-relaxed font-medium">
            {problem.faultDescription}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-[11px] text-amber-300/80 pt-1 border-t border-amber-500/20">
            {problem.initialOpticalPowerDbm && (
              <span>Input Power: <strong className="text-amber-200 font-mono">{problem.initialOpticalPowerDbm}</strong></span>
            )}
            {problem.reportedBy && (
              <span>Reported By: <strong>{problem.reportedBy}</strong></span>
            )}
            {problem.reportedPhone && (
              <a href={`tel:${problem.reportedPhone}`} className="inline-flex items-center gap-1 text-amber-200 underline">
                <Phone size={11} /> {problem.reportedPhone}
              </a>
            )}
          </div>
        </div>
      )}

      {/* Location & Pole Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Site Address</span>
          <p className="font-semibold text-white mt-0.5 line-clamp-2">
            {site?.address || duty?.location || "Sector Distribution Area"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pole / Pillar #</span>
          <p className="font-bold text-[#00d2ff] mt-0.5 font-mono">
            {site?.poleNumber || duty?.nodeNumber || "Pillar Junction"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Distribution Box</span>
          <p className="font-bold text-sky-400 mt-0.5 font-mono">
            {site?.distributionBox || "Splitter Box #1"}
          </p>
        </div>

        <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Landmark</span>
          <p className="font-semibold text-slate-300 mt-0.5 truncate">
            {site?.landmark || "Near Main Transformer"}
          </p>
        </div>
      </div>

      {/* Subscriber Information if attached */}
      {subscriber?.name && (
        <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
              <User size={16} />
            </div>
            <div>
              <p className="font-bold text-white">{subscriber.name} {subscriber.accountNo ? `(Acct: ${subscriber.accountNo})` : ""}</p>
              <p className="text-[11px] text-slate-400">{subscriber.address || "Subscriber Premises"}</p>
            </div>
          </div>

          {subscriber.phone && (
            <a
              href={`tel:${subscriber.phone}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-sky-400 hover:bg-slate-700 hover:text-white shrink-0"
            >
              <Phone size={13} />
              <span>Call Subscriber ({subscriber.phone})</span>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
