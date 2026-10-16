"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  MapPin,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useData } from "@/lib/store";
import { type BranchId } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const { register } = useData();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    preferredBranch: "koregaon" as BranchId,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation on submit
  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    if (!form.email.trim()) newErrors.email = "Email address is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) newErrors.email = "Enter a valid email address";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) {
      setErrors((prev) => ({ ...prev, [k]: "" }));
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const res = await register(form);
    setLoading(false);

    if (!res.ok) {
      setErrors({ form: res.error ?? "Registration failed. Please try again." });
      return;
    }
    toast.success("Account created successfully!");
  }

  // Password strength calculator (0-4)
  const getPasswordStrength = () => {
    if (!form.password) return -1;
    let score = 0;
    if (form.password.length > 5) score += 1;
    if (form.password.length > 7) score += 1;
    if (/[A-Z]/.test(form.password)) score += 1;
    if (/[0-9]/.test(form.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1;
    return Math.min(score, 4);
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
  const strengthColors = ["bg-rose-500", "bg-orange-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];

  const features = [
    { title: "Priority Slot Booking", desc: "Select services, preferred stylists, and times" },
    { title: "Instant Boarding Passes", desc: "Digital queue pass sent to WhatsApp and Email" },
    { title: "Bespoke Styling Dossier", desc: "Personal notes and history saved for your specialist" },
    { title: "Salon Exclusive Offers", desc: "Direct seasonal deals from salon management" },
  ];

  return (
    <div className="flex min-h-screen bg-[#FDFCFB]">
      {/* 1. Left Premium Brand Showcase (Desktop & Tablet) */}
      <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-[#121316] via-[#16181F] to-[#0D0E11] p-10 lg:p-14 text-[#FAF8F5] md:flex md:w-5/12 lg:w-1/2 border-r border-neutral-800/80">
        {/* Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Top Header */}
        <div className="relative z-10 flex items-center gap-3.5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F2128] border border-[#C5A880]/40 font-heading text-xl font-bold text-[#E5D3B3] shadow-md transition-transform group-hover:scale-105">
              G&amp;G
            </div>
            <div>
              <p className="font-heading text-xl font-semibold tracking-tight text-[#FAF8F5]">
                Glow &amp; Glamour
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-medium">
                Hair Studio · Koregaon
              </p>
            </div>
          </Link>
        </div>

        {/* Center Editorial Banner */}
        <div className="relative z-10 space-y-8 my-auto py-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A880]/15 border border-[#C5A880]/30 text-[#E5D3B3] text-xs font-semibold tracking-wider uppercase shadow-xs">
            <Sparkles className="h-3.5 w-3.5 text-[#C5A880]" />
            <span>Join Our Client Network</span>
          </div>

          <div className="space-y-3 max-w-lg">
            <h2 className="font-heading text-3xl lg:text-4xl xl:text-5xl font-normal leading-[1.15] text-[#FAF8F5]">
              Bespoke salon care, tailored to you.
            </h2>
            <p className="text-sm leading-relaxed text-neutral-300 font-light">
              Create an account to reserve appointments with your favorite specialists, track your queue, and access seasonal treatments.
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-lg">
            {features.map((item, i) => (
              <div
                key={i}
                className="p-3.5 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xs space-y-1"
              >
                <div className="flex items-center gap-2 text-[#E5D3B3] text-xs font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-[#C5A880] shrink-0" />
                  <span>{item.title}</span>
                </div>
                <p className="text-[11px] text-neutral-400 font-light leading-snug pl-6">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Studio Location Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-neutral-400">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-[#C5A880] shrink-0" />
            <span className="font-medium text-neutral-300">
              Laxmi Nagar, Koregaon, Maharashtra - 415501
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#C5A880] shrink-0" />
            <span>Encrypted Member Portal</span>
          </div>
        </div>
      </div>

      {/* 2. Right Form Panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-10 md:w-7/12 lg:w-1/2">
        <div className="w-full max-w-[420px] mx-auto space-y-6">
          {/* Mobile Header Wordmark */}
          <Link href="/" className="flex flex-col items-center gap-2 mb-6 md:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#16181F] border border-[#C5A880]/50 font-heading text-lg font-bold text-[#E5D3B3] shadow-md">
              G&amp;G
            </div>
            <div className="text-center">
              <span className="font-heading text-xl font-semibold text-foreground block">
                Glow &amp; Glamour
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Hair Studio · Koregaon
              </span>
            </div>
          </Link>

          {/* Form Header */}
          <div className="text-center md:text-left space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
              Create an Account
            </h1>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Register to book appointments, manage visits, and receive verified passes.
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={submit} className="space-y-4 pt-1" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="text-xs font-semibold text-foreground">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                  <User className="h-4 w-4" />
                </div>
                <Input
                  id="name"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  autoComplete="name"
                  className={cn(
                    "h-11 rounded-lg pl-10 text-sm border-border bg-white shadow-2xs focus-visible:ring-1 focus-visible:ring-neutral-900 focus-visible:border-neutral-900 transition-all",
                    errors.fullName && "border-rose-500 focus-visible:border-rose-500"
                  )}
                />
              </div>
              {errors.fullName && <p className="text-xs text-rose-600 font-medium">{errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-semibold text-foreground">
                Phone Number (WhatsApp)
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                  <Phone className="h-4 w-4" />
                </div>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98220 00000"
                  autoComplete="tel"
                  inputMode="tel"
                  className={cn(
                    "h-11 rounded-lg pl-10 text-sm border-border bg-white shadow-2xs focus-visible:ring-1 focus-visible:ring-neutral-900 focus-visible:border-neutral-900 transition-all",
                    errors.phone && "border-rose-500 focus-visible:border-rose-500"
                  )}
                />
              </div>
              {errors.phone && <p className="text-xs text-rose-600 font-medium">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-semibold text-foreground">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  className={cn(
                    "h-11 rounded-lg pl-10 text-sm border-border bg-white shadow-2xs focus-visible:ring-1 focus-visible:ring-neutral-900 focus-visible:border-neutral-900 transition-all",
                    errors.email && "border-rose-500 focus-visible:border-rose-500"
                  )}
                />
              </div>
              {errors.email && <p className="text-xs text-rose-600 font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-foreground">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  className={cn(
                    "h-11 rounded-lg pl-10 pr-10 text-sm border-border bg-white shadow-2xs focus-visible:ring-1 focus-visible:ring-neutral-900 focus-visible:border-neutral-900 transition-all",
                    errors.password && "border-rose-500 focus-visible:border-rose-500"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-600 font-medium">{errors.password}</p>}

              {/* Password strength meter */}
              {form.password && (
                <div className="pt-1.5 space-y-1">
                  <div className="flex gap-1 h-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-full flex-1 rounded-full transition-all duration-300",
                          i <= strength ? strengthColors[strength] : "bg-neutral-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground text-right font-medium">
                    Strength: {strength >= 0 ? strengthLabels[strength] : ""}
                  </p>
                </div>
              )}
            </div>

            {errors.form && (
              <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700 animate-in fade-in">
                {errors.form}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                className="h-11 w-full rounded-lg bg-[#18181B] hover:bg-black text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Footer switcher */}
          <div className="pt-2 text-center text-xs text-muted-foreground border-t border-border/60">
            <p>
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-foreground hover:underline transition-all">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
