import Link from "next/link";
import { Radio, Zap, ShieldCheck, MapPin, Camera, Activity, ArrowRight, Layers, Users } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background glow & grid effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,210,255,0.15),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-black">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">CableOps</span>
            <span className="ml-1 text-xs font-bold text-cyan-400 uppercase tracking-widest block -mt-1">
              Telecom & ISP Staff OS
            </span>
          </div>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-500/50 px-5 py-2.5 text-xs font-bold text-slate-200 hover:text-white transition shadow-sm"
        >
          <span>Portal Sign In</span>
          <ArrowRight size={14} className="text-cyan-400" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-12 text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-4 py-1.5 text-xs font-bold text-cyan-400 backdrop-blur-md">
          <Zap size={14} className="text-amber-400" />
          <span>Next-Gen Cable Operator & Fiber Linesmen Operations</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-tight">
          Field Staff & Network <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Operations Platform
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed">
          Manage fiber splicing teams, linesmen, and node technicians. Dispatch work orders with GPS coordinates, verify site photo proof, track optical dBm readings, and monitor live field check-ins.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-8 py-4 text-sm font-black text-slate-950 transition shadow-xl shadow-cyan-500/20 active:scale-95"
          >
            <span>Launch Staff Console</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            href="/manager"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900/90 border border-slate-700 hover:border-slate-600 px-8 py-4 text-sm font-bold text-slate-200 hover:text-white transition active:scale-95"
          >
            <ShieldCheck size={16} className="text-cyan-400" />
            <span>NOC Manager Portal</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
          <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/80 p-5 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Camera size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">Site Photos & Proof</h3>
            <p className="mt-1 text-xs text-slate-400">
              Field staff capture before/after work, damage evidence, and optical meter photos with geotags.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/80 p-5 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3">
              <MapPin size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">GPS & Navigation</h3>
            <p className="mt-1 text-xs text-slate-400">
              Direct turn-by-turn Google Maps navigation to exact poles, distribution boxes, and subscriber homes.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/80 p-5 backdrop-blur-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3">
              <Activity size={18} />
            </div>
            <h3 className="text-sm font-bold text-white">Diagnostics & Power dBm</h3>
            <p className="mt-1 text-xs text-slate-400">
              Track optical attenuation, problem reports, affected subscribers, and SOP step verifications.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <p>© 2026 CableOps Network Operating System. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Network Systems Live
          </span>
          <Link href="/login" className="hover:text-slate-300 transition">
            Staff Access
          </Link>
        </div>
      </footer>
    </main>
  );
}