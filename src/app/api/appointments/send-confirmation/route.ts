import { NextRequest, NextResponse } from "next/server";
import { generateBookingTicketPdf } from "@/lib/ticketService";
import { sendBookingConfirmationEmail } from "@/lib/brevoEmailService";
import type { Appointment, Service } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      appointmentId,
      reference,
      customerName,
      customerEmail,
      customerPhone,
      date,
      time,
      services = [],
      staffName,
      priceAtBooking,
    } = body;

    if (!customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json(
        { success: false, warning: "Valid customer email is required to send confirmation." },
        { status: 400 }
      );
    }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      console.warn("[Brevo] BREVO_API_KEY is not configured in .env.local. Email dispatch paused.");
      return NextResponse.json({
        success: false,
        warning: "BREVO_API_KEY is not configured in environment variables. Email dispatch skipped gracefully.",
      });
    }

    // Build mock or populated Appointment object for PDF generator
    const appointmentObj: Appointment = {
      id: appointmentId || reference,
      reference: reference || "BOOKING",
      customerId: "guest",
      customerName: customerName || "Valued Client",
      customerPhone: customerPhone || "",
      customerEmail: customerEmail,
      branchId: "koregaon",
      serviceIds: services.map((s: Service) => s.id),
      date: date || new Date().toISOString().split("T")[0],
      time: time || "10:00",
      status: "pending",
      isWalkIn: false,
      token: null,
      priceAtBooking: priceAtBooking || 0,
      createdAt: new Date().toISOString(),
    };

    // 1. Generate Luxury A4 PDF Ticket with QR Code
    let pdfBase64: string | undefined;
    try {
      const ticketResult = await generateBookingTicketPdf({
        appointment: appointmentObj,
        customerName,
        customerPhone,
        customerEmail,
        services,
        staffName,
      });
      pdfBase64 = ticketResult.base64;
    } catch (pdfErr) {
      console.error("[Ticket PDF] Error generating PDF ticket:", pdfErr);
    }

    // 2. Dispatch Brevo Email with PDF Attachment
    const serviceTitle =
      services.length > 0
        ? services.map((s: Service) => s.name).join(", ")
        : "Sanctuary Treatment";

    const emailResult = await sendBookingConfirmationEmail({
      toEmail: customerEmail,
      customerName: customerName || "Valued Client",
      appointmentId: appointmentId || reference,
      reference: reference || "SANCTUARY",
      serviceName: serviceTitle,
      date,
      time,
      pdfBase64,
    });

    if (!emailResult.success) {
      return NextResponse.json({
        success: false,
        error: emailResult.error,
      });
    }

    return NextResponse.json({
      success: true,
      messageId: emailResult.messageId,
      message: "Booking confirmation email and PDF ticket dispatched successfully.",
    });
  } catch (error: any) {
    console.error("[Send Confirmation API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to dispatch confirmation email" },
      { status: 500 }
    );
  }
}
