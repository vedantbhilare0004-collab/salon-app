"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Camera, CheckCircle2, Search, AlertCircle, RefreshCw, X, ShieldCheck, User, Calendar, Clock, Scissors, CreditCard } from "lucide-react";
import { useData } from "@/lib/store";
import { PageHeader, Section } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatDate, formatTime, formatPrice } from "@/lib/format";
import { StatusChip } from "@/components/ui/status-chip";
import type { Appointment, Service } from "@/lib/types";

export default function OwnerTicketScanner() {
  const { appointments, services, completeAppointment, checkInAppointment } = useData();
  const [isScanning, setIsScanning] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [scannedAppointment, setScannedAppointment] = useState<Appointment | null>(null);
  const [updating, setUpdating] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = "qr-code-scanner-region";

  // Stop scanner safely
  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.error("Error stopping scanner:", e);
      }
    }
    setIsScanning(false);
  };

  // Start scanner
  const startScanner = async () => {
    setScannerError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
      }

      setIsScanning(true);

      const qrConfig = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
      };

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        qrConfig,
        (decodedText) => {
          handleSuccessfulScan(decodedText.trim());
        },
        () => {
          // Frame read callback - ignore frame mismatches
        }
      );
    } catch (err: any) {
      console.error("Scanner start error:", err);
      setScannerError("Camera access denied or unavailable. Please use the manual code lookup below.");
      setIsScanning(false);
    }
  };

  const handleSuccessfulScan = (code: string) => {
    // Find matching appointment by ID or Reference
    const found = appointments.find(
      (a) => a.id.toLowerCase() === code.toLowerCase() || a.reference.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      setScannedAppointment(found);
      toast.success("Ticket verified successfully!");
      // Optionally stop camera once scanned
      stopScanner();
    } else {
      toast.error("Ticket not found in system", {
        description: `Scanned code: ${code}`,
      });
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) return;

    const query = manualCode.trim().toLowerCase();
    const found = appointments.find(
      (a) =>
        a.id.toLowerCase() === query ||
        a.reference.toLowerCase() === query ||
        a.customerPhone?.toLowerCase().includes(query) ||
        a.customerName.toLowerCase().includes(query)
    );

    if (found) {
      setScannedAppointment(found);
      toast.success("Appointment located!");
    } else {
      toast.error("No appointment found matching query.");
    }
  };

  const handleMarkCompleted = async () => {
    if (!scannedAppointment) return;
    setUpdating(true);
    try {
      await completeAppointment(scannedAppointment.id);
      toast.success(`Appointment #${scannedAppointment.reference} marked Completed!`);
      // Update local state to reflect completed
      setScannedAppointment((prev) => (prev ? { ...prev, status: "completed" } : null));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update appointment status");
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckIn = async () => {
    if (!scannedAppointment) return;
    setUpdating(true);
    try {
      await checkInAppointment(scannedAppointment.id);
      toast.success(`Guest #${scannedAppointment.reference} checked in!`);
      setScannedAppointment((prev) => (prev ? { ...prev, status: "checked_in" } : null));
    } catch (err) {
      console.error(err);
      toast.error("Failed to check in guest");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const apptServices: Service[] = scannedAppointment
    ? (scannedAppointment.serviceIds || [])
        .map((id) => services.find((s) => s.id === id))
        .filter(Boolean) as Service[]
    : [];

  const totalPrice = scannedAppointment
    ? scannedAppointment.priceAtBooking || apptServices.reduce((a, b) => a + (b.price || 0), 0) || 0
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Front-Desk Ticket Scanner"
        subtitle="Verify digital QR tickets and check-in guests in real time"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Column: Live Camera Scanner */}
        <Card className="p-6 space-y-4 border border-[#E9E1D6] shadow-2xs bg-[#FFFDFA] rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#A27C48]" />
              <h2 className="text-base font-bold text-[#302A24]">WebRTC Camera Scanner</h2>
            </div>
            {isScanning && (
              <Badge variant="outline" className="bg-[#E0EBDD] text-[#355B3C] border-[#C7DCC2] animate-pulse text-xs font-semibold">
                Camera Live
              </Badge>
            )}
          </div>

          <p className="text-xs text-[#74695E]">
            Point camera at the customer's digital boarding pass QR code.
          </p>

          {/* Scanner Viewport */}
          <div className="relative overflow-hidden rounded-md bg-[#F0EBE3] min-h-[280px] flex items-center justify-center border border-[#E9E1D6]">
            <div id={scannerContainerId} className="w-full h-full min-h-[280px]" />

            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#F6F3ED]/90 text-[#302A24] space-y-3">
                <Camera className="h-10 w-10 text-[#A27C48] mb-1" />
                <p className="text-sm font-semibold text-[#302A24]">Camera is currently paused</p>
                <Button onClick={startScanner} className="gap-2 bg-[#A27C48] hover:bg-[#876438] text-[#FFFDFA] font-medium transition-colors">
                  <RefreshCw className="h-4 w-4" /> Start Scanner Camera
                </Button>
              </div>
            )}
          </div>

          {isScanning && (
            <Button variant="outline" onClick={stopScanner} className="w-full border-[#E9E1D6] text-[#302A24] hover:bg-[#F0EBE3]">
              Pause Camera
            </Button>
          )}

          {scannerError && (
            <div className="p-3 bg-[#F7E7E3] text-[#8C3930] border border-[#EAC8C1] rounded-md text-xs flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{scannerError}</span>
            </div>
          )}

          {/* Manual Code Input Fallback */}
          <div className="pt-4 border-t border-[#E9E1D6]">
            <span className="text-xs font-semibold text-[#74695E] uppercase tracking-wider block mb-2">
              Manual Booking ID / Name Fallback
            </span>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <Input
                placeholder="Enter Booking ID, Phone, or Name..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="h-9 text-xs bg-[#FFFDFA] border-[#E9E1D6] text-[#302A24] placeholder:text-[#74695E] focus-visible:ring-[#A27C48]"
              />
              <Button type="submit" size="sm" className="h-9 gap-1.5 shrink-0 bg-[#A27C48] hover:bg-[#876438] text-[#FFFDFA] font-medium">
                <Search className="h-3.5 w-3.5" /> Lookup
              </Button>
            </form>
          </div>
        </Card>

        {/* Right Column: Scanned Ticket Verification Card */}
        <div className="space-y-4">
          {scannedAppointment ? (
            <Card className="p-6 border border-[#C7DCC2] shadow-2xs bg-[#FFFDFA] rounded-md space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#355B3C]" />
                    <span className="text-xs uppercase font-bold tracking-widest text-[#355B3C]">
                      Ticket Verified
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[#302A24] mt-1">
                    {scannedAppointment.customerName}
                  </h3>
                  <p className="text-xs text-[#74695E]">
                    Ref #{scannedAppointment.reference} · Phone: {scannedAppointment.customerPhone || "N/A"}
                  </p>
                </div>
                <StatusChip status={scannedAppointment.status} />
              </div>

              {/* Service & Time details */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-[#F0EBE3]/50 rounded-md border border-[#E9E1D6] text-xs">
                <div>
                  <span className="text-[#74695E] block text-[10px] uppercase font-semibold">
                    Treatment
                  </span>
                  <span className="font-bold text-[#302A24] block truncate">
                    {apptServices[0]?.name || "Salon Treatment"}
                  </span>
                </div>
                <div>
                  <span className="text-[#74695E] block text-[10px] uppercase font-semibold">
                    Total Amount
                  </span>
                  <span className="font-bold text-[#302A24] block">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <div>
                  <span className="text-[#74695E] block text-[10px] uppercase font-semibold">
                    Date
                  </span>
                  <span className="font-medium text-[#302A24] block">
                    {formatDate(scannedAppointment.date)}
                  </span>
                </div>
                <div>
                  <span className="text-[#74695E] block text-[10px] uppercase font-semibold">
                    Time Slot
                  </span>
                  <span className="font-medium text-[#302A24] block">
                    {formatTime(scannedAppointment.startTime || scannedAppointment.time)}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2 pt-2">
                {scannedAppointment.status !== "completed" && (
                  <Button
                    onClick={handleMarkCompleted}
                    disabled={updating}
                    className="w-full bg-[#355B3C] hover:bg-[#2A4930] text-[#FFFDFA] gap-2 font-medium transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {updating ? "Updating..." : "1-Click: Mark as Completed"}
                  </Button>
                )}

                {scannedAppointment.status === "pending" || scannedAppointment.status === "confirmed" ? (
                  <Button
                    variant="outline"
                    onClick={handleCheckIn}
                    disabled={updating}
                    className="w-full text-xs border-[#E9E1D6] bg-[#FFFDFA] text-[#302A24] hover:bg-[#F0EBE3]"
                  >
                    Check In Guest (Arrived)
                  </Button>
                ) : null}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScannedAppointment(null)}
                  className="w-full text-xs text-[#74695E] hover:text-[#302A24] hover:bg-[#F0EBE3]"
                >
                  Clear &amp; Scan Next Ticket
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center border-dashed border-2 border-[#E9E1D6] bg-[#FFFDFA] rounded-md flex flex-col items-center justify-center text-[#74695E] space-y-3">
              <ShieldCheck className="h-12 w-12 text-[#A27C48]/30" />
              <div>
                <p className="font-semibold text-[#302A24]">Awaiting Ticket Scan</p>
                <p className="text-xs text-[#74695E] mt-1 max-w-xs">
                  Scan a customer's QR boarding pass or enter the booking reference to verify details.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
