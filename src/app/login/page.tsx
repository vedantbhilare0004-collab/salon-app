"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function LoginPage() {
  const { login, resetPassword } = useData();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (mode === "reset") {
      if (!identifier.trim()) {
        setError("Please enter your email address.");
        return;
      }
      setLoading(true);
      const res = await resetPassword(identifier.trim());
      setLoading(false);
      if (!res.ok) {
        setError(res.error ?? "Failed to send reset email.");
        return;
      }
      setMessage("Password reset email sent! Please check your inbox.");
      return;
    }

    if (!identifier.trim() || !password) {
      setError("Please enter your login identifier and password.");
      return;
    }
    setLoading(true);
    const res = await login(identifier.trim(), password);
    setLoading(false);
    if (!res.ok) {
      setError(res.error ?? "Login failed. Please check your credentials.");
      return;
    }
    toast.success("Welcome back!");
  }

  return (
    <div className="flex min-h-screen bg-[#F8F5EF] text-[#292724]">
      {/* 1. Left Editorial Brand Sidebar (Desktop & Large Tablet: ~48% width) */}
      <aside className="relative hidden w-full lg:flex lg:w-[48%] xl:w-[46%] flex-col justify-between overflow-hidden bg-[#292724] p-10 xl:p-14 text-[#F8F5EF] border-r border-[#38342F] shrink-0">
        {/* A. Brand Identity Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3.5 group">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl overflow-hidden border border-[#C2A779]/40 bg-[#1A1917] shadow-xs transition-transform duration-300 group-hover:scale-105 shrink-0">
              <img
                src="/pwa-192x192.png"
                alt="Glow & Glamour Monogram"
                width={44}
                height={44}
                className="w-full h-full object-cover select-none"
              />
            </div>
            <div className="leading-tight">
              <p className="font-heading text-xl font-medium tracking-tight text-[#F8F5EF]">
                Glow &amp; Glamour
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#C2A779] font-medium">
                HAIR STUDIO &amp; SPA · KOREGAON
              </p>
            </div>
          </Link>
        </div>

        {/* B & C. Main Headline & Short Description */}
        <div className="relative z-10 my-auto py-12 max-w-md space-y-6">
          <h2 className="font-heading text-4xl lg:text-[44px] xl:text-[50px] font-normal leading-[1.14] text-[#F8F5EF] tracking-tight">
            Beauty, styled beautifully.
          </h2>
          <p className="text-sm lg:text-[15px] leading-relaxed text-[#DCD5CA] font-light">
            Expert hair care and personalised salon services for everyone, right here in Koregaon.
          </p>
        </div>

        {/* D. Location Footer */}
        <div className="relative z-10 pt-6 border-t border-[#3D3A35] flex items-center gap-2.5 text-xs text-[#DCD5CA]/80">
          <MapPin className="h-4 w-4 text-[#C2A779] shrink-0" strokeWidth={1.75} />
          <span className="font-light tracking-wide">
            Laxmi Nagar, Koregaon, Maharashtra – 415501
          </span>
        </div>
      </aside>

      {/* 2. Right Sign-in Form Panel (~52% width on desktop, 100% on mobile/tablet) */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 sm:px-8 py-8 sm:py-12 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="w-full max-w-[420px] mx-auto space-y-6 sm:space-y-7">
          {/* Mobile Brand Identity Header (Visible only on mobile/tablet < lg) */}
          <div className="flex flex-col items-center text-center lg:hidden mb-1">
            <Link href="/" className="inline-flex flex-col items-center gap-2.5 group">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden border border-[#DCD5CA] bg-[#292724] shadow-xs shrink-0 transition-transform group-hover:scale-105">
                <img
                  src="/pwa-192x192.png"
                  alt="Glow & Glamour Monogram"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover select-none"
                />
              </div>
              <div className="leading-tight">
                <p className="font-heading text-xl font-medium tracking-tight text-[#292724]">
                  Glow &amp; Glamour
                </p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-[#766D61] font-medium">
                  HAIR STUDIO &amp; SPA · KOREGAON
                </p>
              </div>
            </Link>
          </div>

          {/* Form Header */}
          <div className="text-center lg:text-left space-y-1.5">
            <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-[#292724]">
              {mode === "reset" ? "Reset Password" : "Welcome Back"}
            </h1>
            <p className="text-xs sm:text-sm text-[#766D61] font-light leading-relaxed">
              {mode === "reset"
                ? "Enter your email address and we'll send a password recovery link."
                : "Sign in to manage your appointments, styling preferences, and digital passes."}
            </p>
          </div>

          {/* Authentication Form */}
          <form onSubmit={submit} className="space-y-4 pt-1">
            {/* Identifier Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="identifier"
                className="text-xs font-semibold text-[#292724] block"
              >
                Email, Phone, or User ID
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#766D61]/70 pointer-events-none">
                  <Mail className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <Input
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or phone number"
                  autoComplete="username"
                  disabled={loading}
                  className="h-12 rounded-lg pl-10 text-sm border-[#DCD5CA] bg-white shadow-2xs text-[#292724] placeholder:text-[#766D61]/50 focus-visible:ring-1 focus-visible:ring-[#292724] focus-visible:border-[#292724] transition-all"
                />
              </div>
            </div>

            {/* Password Field (Login Mode Only) */}
            {mode === "login" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-[#292724]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setError("");
                      setMessage("");
                    }}
                    className="text-xs font-medium text-[#766D61] hover:text-[#292724] transition-colors py-0.5"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#766D61]/70 pointer-events-none">
                    <Lock className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    autoComplete="current-password"
                    disabled={loading}
                    className="h-12 rounded-lg pl-10 pr-11 text-sm border-[#DCD5CA] bg-white shadow-2xs text-[#292724] placeholder:text-[#766D61]/50 focus-visible:ring-1 focus-visible:ring-[#292724] focus-visible:border-[#292724] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#766D61]/70 hover:text-[#292724] transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={1.75} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error & Success Feedback */}
            {error && (
              <div
                role="alert"
                className="rounded-lg bg-rose-50/90 border border-rose-200 p-3 text-xs font-medium text-rose-700 animate-in fade-in"
              >
                {error}
              </div>
            )}
            {message && (
              <div
                role="status"
                className="rounded-lg bg-emerald-50/90 border border-emerald-200 p-3 text-xs font-medium text-emerald-800 animate-in fade-in"
              >
                {message}
              </div>
            )}

            {/* Submit Action Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={loading}
                className="h-12 w-full rounded-lg bg-[#292724] hover:bg-[#1E1C1A] text-[#F8F5EF] text-xs uppercase tracking-wider font-semibold shadow-xs hover:shadow-sm transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#C2A779]" />
                    {mode === "reset" ? "Sending Link..." : "Signing In..."}
                  </>
                ) : mode === "reset" ? (
                  "Send Reset Link"
                ) : (
                  <>
                    Sign In <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer Navigation / Switcher Link */}
          <div className="pt-4 text-center text-xs text-[#766D61] border-t border-[#DCD5CA]/70">
            {mode === "reset" ? (
              <p>
                Remembered your password?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setMessage("");
                  }}
                  className="font-semibold text-[#292724] hover:underline underline-offset-4 transition-all ml-1"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                New client?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-[#292724] hover:underline underline-offset-4 transition-all ml-1"
                >
                  Create an account
                </Link>
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
