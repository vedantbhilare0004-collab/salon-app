"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { appointmentService } from "@/lib/services/appointmentService";
import { Appointment } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Calendar as CalendarIcon, Clock, Loader2, Share2, Copy, QrCode } from "lucide-react";
import Link from "next/link";
import { STATUS_LABELS } from "@/lib/types";

export function AppointmentDetails({ reference }: { reference: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const data = await appointmentService.getByReference(reference, token || undefined);
        
        if (!data) {
          setError("Appointment not found.");
          return;
        }

        // Validate the secure token if this is a guest
        if (data.customerId === "guest" && data.secureToken !== token) {
          setError("Invalid security token. You do not have permission to view this booking.");
          return;
        }

        setAppointment(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load appointment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [reference, token]);

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <Card className="flex h-64 items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </Card>
    );
  }

  if (error || !appointment) {
    return (
      <Card className="p-8 text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          !
        </div>
        <h2 className="text-xl font-semibold">Error</h2>
        <p className="text-neutral-500">{error}</p>
        <Button asChild className="mt-4">
          <Link href="/">Return Home</Link>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-neutral-200/50 shadow-xl bg-white/50 backdrop-blur-xl">
      <div className="bg-primary p-8 text-center text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
        <div className="relative z-10 flex flex-col items-center">
          <CheckCircle2 className="h-16 w-16 mb-4" />
          <h1 className="text-2xl font-bold tracking-tight mb-2">Booking Confirmed!</h1>
          <p className="opacity-90 max-w-sm">
            Thank you, {appointment.customerName}. Your appointment has been received and is currently <strong className="font-semibold">{STATUS_LABELS[appointment.status]}</strong>.
          </p>
        </div>
      </div>
      
      <div className="p-6 md:p-8 space-y-6">
        <div className="grid gap-4 rounded-xl border p-4 bg-neutral-50/50">
          <div className="grid grid-cols-[24px_1fr] items-start gap-3">
            <CalendarIcon className="h-5 w-5 text-neutral-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-neutral-500">Date</div>
              <div className="font-medium text-neutral-900">{new Date(appointment.date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>
          
          <div className="h-px bg-neutral-200" />
          
          <div className="grid grid-cols-[24px_1fr] items-start gap-3">
            <Clock className="h-5 w-5 text-neutral-400 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-neutral-500">Time</div>
              <div className="font-medium text-neutral-900">{appointment.time}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-neutral-500 uppercase tracking-wider">Booking Reference</div>
          <div className="flex items-center justify-between rounded-lg bg-neutral-100 p-3 font-mono text-lg font-bold tracking-widest text-neutral-700">
            {appointment.reference}
            <Button variant="ghost" size="icon" onClick={copyLink} title="Copy tracking link">
              {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-neutral-500">Save this reference or bookmark this page to check your booking status.</p>
        </div>

        <div className="pt-2 space-y-3">
          <Link href={`/customer/bookings/${appointment.id || appointment.reference}`}>
            <Button className="w-full bg-[#2B2B2B] hover:bg-black text-white gap-2 font-medium h-11 rounded-sm text-xs uppercase tracking-wider">
              <QrCode className="h-4 w-4 text-[#E5D3B3]" /> View Official QR Boarding Pass
            </Button>
          </Link>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1 rounded-sm text-xs">
              <Link href="/">Return Home</Link>
            </Button>
            <Button onClick={copyLink} variant="outline" className="flex-1 gap-2 rounded-sm text-xs">
              <Share2 className="h-4 w-4" />
              {copied ? "Copied!" : "Share Link"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
