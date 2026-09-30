"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  ShieldCheck,
  Radio,
  Zap,
} from "lucide-react";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { writeAuth } from "@/lib/auth-storage";
import type { AuthResult } from "@/types/auth";

interface LoginResponse {
  success: boolean;
  message: string;
  data?: AuthResult;
}

export default function LoginForm() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: email.trim(),
          password,
        }),
      });

      const result: LoginResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Login failed"
        );
      }

      if (!result.data) {
        throw new Error("Invalid login response");
      }

      const { user, token } = result.data;

      writeAuth(token, user);

      // Redirect based on role (manager/admin -> /manager, staff -> /staff)
      const role = (user.role || "").toLowerCase();
      if (role === "admin" || role === "manager") {
        router.push("/manager");
      } else {
        router.push("/staff");
      }
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return ( 
    <div className="w-full max-w-md"> 
      {/* Brand Icon Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20 text-slate-950 font-black mb-3">
          <Radio size={32} className="animate-pulse" />
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">CableOps Portal</h2>
        <p className="text-xs text-slate-400 mt-1">Network Operations & Field Staff OS</p>
      </div>

      {/* Card */} 
      <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-6 sm:p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur-md">
        {/* Error message */} 
        {error && ( 
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3"> 
            <p className="text-xs font-bold text-red-400">{error}</p> 
          </div> 
        )} 
      
        {/* Form */} 
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            id="email"
            name="email"
            type="email"
            label="Email or Username"
            placeholder="e.g. rahul@cableops.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            leftIcon={<Mail size={18} className="text-cyan-400" />}
            variant="dark"
            required
            autoComplete="email" 
          />

          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            leftIcon={<LockKeyhole size={18} className="text-cyan-400" />}
            variant="dark"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="pointer-events-auto rounded-md p-1 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
            required
            autoComplete="current-password" 
          />
          
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black tracking-wide shadow-lg shadow-cyan-500/20"
            disabled={loading}
          >
            {loading ? "Authenticating..." : (
              <span className="flex items-center justify-center gap-2">
                Sign In to Console <ArrowRight size={17} />
              </span>
            )}
          </Button>
        </form>

        {/* Quick Demo Credentials for Fast Testing */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/80 p-4">
          <div className="flex items-start gap-3">
            <Zap size={18} className="mt-0.5 shrink-0 text-amber-400"/>
            <div className="w-full">
              <p className="text-xs font-bold text-white">Quick Demo Access</p>
              <p className="mt-0.5 text-[11px] text-slate-400">Click to autofill credentials:</p>
              
              <div className="mt-2.5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => { 
                    setEmail("admin@cableops.com");
                    setPassword("admin123"); 
                  }}
                  className="rounded-lg bg-cyan-950/60 border border-cyan-500/30 px-3 py-1.5 text-left text-xs font-semibold text-cyan-300 transition hover:bg-cyan-900/50 cursor-pointer"
                >
                  📡 NOC Manager: <span className="font-mono text-white">admin@cableops.com</span>
                </button>
                  
                <button
                  type="button"
                  onClick={() => { 
                    setEmail("rahul@cableops.com");
                    setPassword("password123");
                  }}
                  className="rounded-lg bg-blue-950/60 border border-blue-500/30 px-3 py-1.5 text-left text-xs font-semibold text-blue-300 transition hover:bg-blue-900/50 cursor-pointer" 
                >
                  ⚡ Field Tech: <span className="font-mono text-white">rahul@cableops.com</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-6 text-center">
        <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-cyan-400 transition">
          ← Back to CableOps Portal
        </Link>
      </div>
    </div> 
  );
}