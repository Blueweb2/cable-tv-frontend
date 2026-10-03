"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  BadgeCheck,
  Building,
  CheckCircle2,
  Edit3,
  Hash,
  KeyRound,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  User,
  UserRound,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { get, put, patch, ApiResponse } from "@/lib/api";

interface StaffProfile {
  id: string;
  username?: string;
  employeeId?: string;
  department?: string;
  specialization?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  employmentType: string;
  role: string;
  status: string;
  joinedDate: string;
}

export default function StaffProfilePage() {
  const { token, user: authUser } = useAuth();
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"details" | "edit" | "security">(
    "details"
  );

  // Edit Profile Form State
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passSuccess, setPassSuccess] = useState("");
  const [passError, setPassError] = useState("");

  const loadProfile = async () => {
    setLoading(true);

    try {
      if (!token) {
        setError("You are not authenticated.");
        setLoading(false);
        return;
      }
      setError("");
      const result = await get<ApiResponse<{ user: StaffProfile }>>(
        "/users/me",
        token
      );
      if (result.data?.user) {
        setProfile(result.data.user);
        setEditName(result.data.user.name || "");
        setEditPhone(result.data.user.phone || "");
        setEditLocation(result.data.user.location || "");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load staff profile."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, [token]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setSaveLoading(true);
      setSaveError("");
      setSaveSuccess("");

      const result = await put<ApiResponse<{ user: StaffProfile }>>(
        "/users/me",
        {
          name: editName,
          phone: editPhone,
          location: editLocation,
        },
        token
      );

      if (result.data?.user) {
        setProfile(result.data.user);
        setSaveSuccess("Profile details updated successfully!");
        setActiveTab("details");
      }
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Failed to update profile."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (newPassword !== confirmPassword) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPassError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setPassLoading(true);
      setPassError("");
      setPassSuccess("");

      await patch<ApiResponse<null>>(
        "/users/me/password",
        {
          currentPassword,
          newPassword,
        },
        token
      );

      setPassSuccess("Password updated successfully! Keep your credentials safe.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPassError(
        err instanceof Error ? err.message : "Failed to update password."
      );
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <main className="space-y-6 py-5 sm:space-y-8 sm:py-6 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800 pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
          Staff Portal
        </p>
        <h1 className="mt-1 text-2xl font-bold text-white sm:text-3xl">
          My Account & Credentials
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          View employment credentials, update personal details, and manage login security.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs text-red-300"
        >
          <AlertCircle size={16} />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-slate-800 bg-[#0f172a]">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-800 border-t-cyan-400" />
            <p className="mt-3 text-xs font-semibold text-slate-400">
              Loading profile details...
            </p>
          </div>
        </div>
      ) : !profile ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-950/40 p-6 text-center text-xs text-red-300">
          Profile data not found. Please log in again.
        </div>
      ) : (
        <>
          {/* Main Hero Profile Banner */}
          <section className="overflow-hidden rounded-3xl border border-slate-800 bg-[#0f172a] shadow-sm">

            {/* Profile Header */}
            <div className="relative overflow-hidden border-b border-slate-800 bg-slate-900/80 px-5 py-6 sm:px-8 sm:py-7">
              {/* Decorative background */}
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-cyan-500/10" />
              <div className="absolute -bottom-16 right-20 h-28 w-28 rounded-full bg-cyan-500/5" />

              <div className="relative flex items-center gap-4 sm:gap-5">

                {/* Avatar */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-slate-900 bg-gradient-to-br from-sky-600 to-cyan-500 text-white shadow-md sm:h-20 sm:w-20">
                  <UserRound size={30} className="sm:hidden" />
                  <UserRound size={36} className="hidden sm:block" />
                </div>

                {/* Main Info */}
                <div className="min-w-0 flex-1">
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-xl font-extrabold tracking-tight text-white sm:text-2xl">
                      {profile.name}
                    </h2>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      {profile.status}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-semibold capitalize text-cyan-400">
                    {profile.specialization ? `${profile.specialization} · ` : ""}{profile.role} · {profile.department || "Fiber & Field Operations"}
                  </p>

                  {/* Meta information */}
                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Hash size={12} className="text-cyan-400" />
                      {profile.employeeId || "EMP-" + profile.id.slice(-6).toUpperCase()}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <BadgeCheck size={12} className="text-cyan-400" />
                      {profile.employmentType || "Full-Time"}
                    </span>
                  </div>

                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-800 bg-slate-900/50 p-2 sm:px-6 sm:pt-0 sm:pb-0">
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-800/50 p-1 sm:flex sm:gap-0 sm:rounded-none sm:bg-transparent sm:p-0">

                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-[11px] font-bold transition sm:rounded-none sm:border-b-2 sm:px-3 sm:py-3.5 sm:text-xs ${
                    activeTab === "details"
                      ? "bg-[#0f172a] text-cyan-400 shadow-sm sm:border-cyan-400 sm:bg-transparent sm:shadow-none"
                      : "border-transparent text-slate-500 hover:text-white"
                  }`}
                >
                  <User size={14} className="shrink-0" />
                  <span className="sm:hidden">Profile</span>
                  <span className="hidden sm:inline">Profile Information</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-[11px] font-bold transition sm:rounded-none sm:border-b-2 sm:px-3 sm:py-3.5 sm:text-xs ${
                    activeTab === "edit"
                      ? "bg-[#0f172a] text-cyan-400 shadow-sm sm:border-cyan-400 sm:bg-transparent sm:shadow-none"
                      : "border-transparent text-slate-500 hover:text-white"
                  }`}
                >
                  <Edit3 size={14} className="shrink-0" />
                  <span className="sm:hidden">Edit</span>
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("security")}
                  className={`flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-[11px] font-bold transition sm:rounded-none sm:border-b-2 sm:px-3 sm:py-3.5 sm:text-xs ${
                    activeTab === "security"
                      ? "bg-[#0f172a] text-cyan-400 shadow-sm sm:border-cyan-400 sm:bg-transparent sm:shadow-none"
                      : "border-transparent text-slate-500 hover:text-white"
                  }`}
                >
                  <ShieldCheck size={14} className="shrink-0" />
                  <span className="sm:hidden">Security</span>
                  <span className="hidden sm:inline">Security & Password</span>
                </button>

              </div>
            </div>

            {/* Tab 1: Profile Details */}
            {activeTab === "details" && (
              <div className="p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Info
                    icon={<Mail size={16} />}
                    label="Email Address"
                    value={profile.email}
                  />

                  <Info
                    icon={<Phone size={16} />}
                    label="Phone Number"
                    value={profile.phone || "Not provided"}
                  />

                  <Info
                    icon={<MapPin size={16} />}
                    label="Location / Base City"
                    value={profile.location || "Not provided"}
                  />

                  <Info
                    icon={<Building size={16} />}
                    label="Department"
                    value={profile.department || "Fiber & Field Operations"}
                  />

                  <Info
                    icon={<ShieldCheck size={16} />}
                    label="Specialization"
                    value={profile.specialization || "General Field Technician"}
                  />

                  <Info
                    icon={<Hash size={16} />}
                    label="Employee ID"
                    value={profile.employeeId || "EMP-" + profile.id.slice(-6).toUpperCase()}
                  />

                  <Info
                    icon={<User size={16} />}
                    label="Username"
                    value={profile.username || "Staff User"}
                  />

                  <Info
                    icon={<BadgeCheck size={16} />}
                    label="Joined Date"
                    value={formatDate(profile.joinedDate)}
                  />

                  <Info
                    icon={<ShieldCheck size={16} />}
                    label="System Role"
                    value={profile.role.toUpperCase()}
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Edit Profile Form */}
            {activeTab === "edit" && (
              <div className="p-6">
                {saveSuccess && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/20 p-3 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={16} />
                    <span>{saveSuccess}</span>
                  </div>
                )}

                {saveError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/20 p-3 text-xs font-semibold text-red-400 border border-red-500/30">
                    <AlertCircle size={16} />
                    <span>{saveError}</span>
                  </div>
                )}

                <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98765 43210"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Location / Base City
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai / Delhi NCR"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saveLoading}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-6 text-xs font-bold text-slate-950 shadow-sm transition hover:bg-cyan-500 disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saveLoading ? "Saving Changes..." : "Save Profile Details"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tab 3: Security & Password */}
            {activeTab === "security" && (
              <div className="p-6">
                {passSuccess && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/20 p-3 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={16} />
                    <span>{passSuccess}</span>
                  </div>
                )}

                {passError && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/20 p-3 text-xs font-semibold text-red-400 border border-red-500/30">
                    <AlertCircle size={16} />
                    <span>{passError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passLoading}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-800 px-6 text-xs font-bold text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-50"
                    >
                      <Lock size={16} />
                      {passLoading ? "Updating Password..." : "Update Security Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "Not available";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center gap-2 text-cyan-400">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      </div>
      <p className="mt-2 text-sm font-bold text-slate-200">{value}</p>
    </div>
  );
}