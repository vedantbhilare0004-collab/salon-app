"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Download, Printer, Calendar, Clock, MapPin, User, Scissors, CheckCircle, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { useData } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDate, formatTime, formatPrice } from "@/lib/format";
import { generateBookingTicketPdf } from "@/lib/ticketService";
import { toast } from "sonner";
import type { Appointment, Service } from "@/lib/types";

export default function DigitalTicketPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const { appointments, services, users } = useData();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const found = appointments.find((a) => a.id === params.id || a.reference === params.id);
    if (found) {
      setAppointment(found);
    }
  }, [appointments, params.id]);

  if (!appointment) {
    // If not immediately found in local cache, check if still loading
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground text-sm">Locating your digital boarding pass...</p>
        <Link href="/customer/bookings" className="mt-4 text-xs font-medium text-primary hover:underline">
          Return to Bookings
        </Link>
      </div>
    );
  }

  const apptServices: Service[] = (appointment.serviceIds || [])
    .map((sId) => services.find((s) => s.id === sId))
    .filter(Boolean) as Service[];

  const primaryService = apptServices[0]?.name || "Luxury Salon Treatment";
  const totalPrice = appointment.priceAtBooking || apptServices.reduce((a, b) => a + (b.price || 0), 0) || 0;
  const staffMember = users.find((u) => u.id === appointment.assignedStaffId || u.uid === appointment.assignedStaffId);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      const { doc } = await generateBookingTicketPdf({
        appointment,
        customerName: appointment.customerName,
        customerPhone: appointment.customerPhone,
        services: apptServices,
        staffName: staffMember?.fullName,
      });
      doc.save(`Ticket-${appointment.reference || appointment.id}.pdf`);
      toast.success("Ticket downloaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate PDF ticket");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4 px-2 sm:px-0">
      {/* Top back navigation and action buttons */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/customer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Bookings
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 rounded-sm text-xs">
            <Printer className="h-3.5 w-3.5" /> Print
          </Button>
          <Button size="sm" onClick={handleDownloadPdf} disabled={downloading} className="gap-1.5 rounded-sm text-xs">
            <Download className="h-3.5 w-3.5" /> {downloading ? "Preparing..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Luxury Digital Boarding Pass Card */}
      <Card className="overflow-hidden border border-border/80 shadow-xl bg-card rounded-sm relative">
        {/* Header Ribbon */}
        <div className="bg-[#222220] text-[#FAF8F5] p-6 sm:p-8 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-1.5">
            <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-medium">
              Official Booking Ticket
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-[#FAF8F5]">
            Glow &amp; Glamour Hair Studio
          </h1>
          <p className="text-xs text-[#ECEAE4]/80 mt-1">
            Laxmi Nagar, Koregaon · Hair Studio &amp; Spa
          </p>
        </div>

        {/* Mid Ticket Notch Bar (Boarding Pass Aesthetic) */}
        <div className="relative flex items-center justify-between px-6 py-3 bg-secondary/50 border-y border-border/60">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Status: <span className="text-emerald-700 font-bold">{appointment.status.toUpperCase()}</span>
            </span>
          </div>
          <span className="font-mono text-xs font-bold text-muted-foreground">
            REF: #{appointment.reference}
          </span>
        </div>

        {/* Content Section */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Service & QR Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px] gap-6 items-center">
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Treatment / Service
                </span>
                <h2 className="font-heading text-2xl font-bold text-foreground mt-0.5">
                  {primaryService}
                </h2>
                {apptServices.length > 1 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    + {apptServices.slice(1).map((s) => s.name).join(", ")}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date
                  </span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatDate(appointment.date)}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Time
                  </span>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {formatTime(appointment.startTime || appointment.time)}
                  </p>
                </div>
              </div>
            </div>

            {/* QR Code Verification Window */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-sm border border-border/70 shadow-sm">
              <QRCodeSVG
                value={appointment.id || appointment.reference}
                size={130}
                level="M"
                includeMargin={false}
              />
              <span className="text-[9px] font-mono tracking-widest text-neutral-500 mt-2 uppercase">
                Scan to Verify
              </span>
            </div>
          </div>

          {/* Dotted separator line */}
          <div className="border-t border-dashed border-border" />

          {/* Guest & Appointment Details */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <User className="h-3 w-3" /> Guest
              </span>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-0.5 truncate">
                {appointment.customerName}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                <Scissors className="h-3 w-3" /> Stylist
              </span>
              <p className="text-xs sm:text-sm font-medium text-foreground mt-0.5 truncate">
                {staffMember?.fullName || "Assigned Stylist"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Locked Price
              </span>
              <p className="text-xs sm:text-sm font-bold text-foreground mt-0.5">
                {totalPrice > 0 ? formatPrice(totalPrice) : "Free / Consultation"}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Ticket ID
              </span>
              <p className="font-mono text-xs text-muted-foreground mt-0.5 truncate" title={appointment.id}>
                {appointment.id.substring(0, 10)}...
              </p>
            </div>
          </div>

          {/* Salon Address Box */}
          <div className="flex items-start gap-2.5 p-3.5 bg-muted/40 rounded-sm border border-border/50 text-xs">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Glow &amp; Glamour Hair Studio — Koregaon</p>
              <p className="text-muted-foreground mt-0.5">
                Near ZP School, Laxmi Nagar, Koregaon · +91 70582 39061
              </p>
            </div>
          </div>

          {/* Check-in Instructions */}
          <div className="text-center pt-2">
            <p className="text-xs text-muted-foreground italic flex items-center justify-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600 inline" />
              Present this QR code on your mobile device at reception upon arrival for instant check-in.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
