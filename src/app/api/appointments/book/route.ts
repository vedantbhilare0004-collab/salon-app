import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { generateBookingTicketPdf } from "@/lib/ticketService";
import { sendBookingConfirmationEmail } from "@/lib/brevoEmailService";
import { generateRandomString } from "@/lib/booking-utils";
import type { Appointment, AppointmentStatus, Service } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customerName,
      customerPhone,
      customerEmail,
      customerId = "guest",
      customerUid,
      customerRole,
      branchId = "koregaon",
      serviceIds = [],
      services = [],
      staffId,
      staffName = "Any Available Specialist",
      date,
      time,
      priceAtBooking = 0,
      notes = "",
      offerId,
    } = body;

    // Validation
    if (customerRole === "owner") {
      return NextResponse.json(
        { success: false, error: "Salon owners cannot book client appointments. Please use Reception Mode or Owner Operations Suite." },
        { status: 403 }
      );
    }

    if (!customerName || !customerName.trim()) {
      return NextResponse.json({ success: false, error: "Customer name is required" }, { status: 400 });
    }

    if (!customerPhone || !customerPhone.trim()) {
      return NextResponse.json({ success: false, error: "Customer phone number is required" }, { status: 400 });
    }

    if (!customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json({ success: false, error: "Valid customer email is required for confirmation" }, { status: 400 });
    }

    if (!date || !time) {
      return NextResponse.json({ success: false, error: "Appointment date and time are required" }, { status: 400 });
    }

    if (!adminDb) {
      console.error("[Book API] Firebase Admin DB is not initialized");
      return NextResponse.json({ success: false, error: "Server database configuration error" }, { status: 500 });
    }

    let finalPrice = Number(priceAtBooking) || 0;
    let verifiedOfferTitle: string | undefined;
    let verifiedOriginalPrice: number | undefined;
    let verifiedDiscountAmount: number | undefined;

    // Authoritative Server-Side Offer Validation
    if (offerId) {
      try {
        const offerSnap = await adminDb.collection("offers").doc(offerId).get();
        if (!offerSnap.exists) {
          return NextResponse.json(
            { success: false, error: "The selected promotional offer is no longer available. Please select another offer or regular services." },
            { status: 400 }
          );
        }
        const offerData = offerSnap.data() as any;
        if (offerData.active === false) {
          return NextResponse.json(
            { success: false, error: "This promotional package is currently paused. Please select another service." },
            { status: 400 }
          );
        }

        // Validate expiration date if configured
        if (offerData.endsAt) {
          const expiryTime = new Date(`${offerData.endsAt}T23:59:59`).getTime();
          if (!isNaN(expiryTime) && Date.now() > expiryTime) {
            return NextResponse.json(
              { success: false, error: "This promotional offer has expired. Please explore our other current packages." },
              { status: 400 }
            );
          }
        }

        // Authoritative server-side price from the verified offer document
        if (typeof offerData.price === "number") {
          finalPrice = offerData.price;
        }
        verifiedOfferTitle = offerData.title;
        verifiedOriginalPrice = offerData.originalPrice || undefined;
        if (offerData.originalPrice && offerData.price && offerData.originalPrice > offerData.price) {
          verifiedDiscountAmount = offerData.originalPrice - offerData.price;
        } else if (offerData.discountAmount) {
          verifiedDiscountAmount = offerData.discountAmount;
        }
      } catch (offerErr: any) {
        console.error("[Book API] Error verifying offer:", offerErr);
        return NextResponse.json(
          { success: false, error: "Unable to verify promotional offer eligibility. Please try again." },
          { status: 500 }
        );
      }
    }

    const reference = generateRandomString(8).toUpperCase();
    const secureToken = generateRandomString(32);
    const now = new Date().toISOString();

    const appointmentData: Omit<Appointment, "id"> = {
      reference,
      secureToken,
      customerId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      customerUid: customerUid || undefined,
      customerRole: customerRole || undefined,
      branchId: branchId || "koregaon",
      serviceIds: serviceIds.length > 0 ? serviceIds : services.map((s: Service) => s.id),
      serviceId: serviceIds[0] || services[0]?.id || undefined,
      date,
      time,
      startTime: time,
      priceAtBooking: finalPrice,
      offerId: offerId || undefined,
      offerTitle: verifiedOfferTitle,
      originalPrice: verifiedOriginalPrice,
      discountAmount: verifiedDiscountAmount,
      status: "pending" as AppointmentStatus,
      isWalkIn: false,
      token: null,
      notes: notes || "",
      source: "website",
      createdAt: now,
      updatedAt: now,
    };

    if (staffId && staffId !== "any") {
      appointmentData.assignedStaffId = staffId;
      appointmentData.staffId = staffId;
    }

    // 1. Save directly into Firestore using admin privileges (bypasses client security rules)
    const cleanData: Record<string, any> = {};
    Object.entries(appointmentData).forEach(([key, val]) => {
      if (val !== undefined) {
        cleanData[key] = val;
      }
    });

    const docRef = await adminDb.collection("appointments").add(cleanData);
    const appointmentId = docRef.id;

    // 2. Generate Luxury A4 PDF Ticket with QR Code
    let pdfBase64: string | undefined;
    try {
      const ticketResult = await generateBookingTicketPdf({
        appointment: { id: appointmentId, ...appointmentData } as Appointment,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        services,
        staffName,
      });
      pdfBase64 = ticketResult.base64;
    } catch (pdfErr) {
      console.error("[Ticket PDF] Error generating PDF ticket:", pdfErr);
    }

    // 3. Dispatch Brevo Confirmation Email with PDF Ticket attached
    const serviceTitle =
      services.length > 0
        ? services.map((s: Service) => s.name).join(", ")
        : "Sanctuary Treatment";

    try {
      await sendBookingConfirmationEmail({
        toEmail: customerEmail.trim(),
        customerName: customerName.trim(),
        appointmentId,
        reference,
        serviceName: serviceTitle,
        date,
        time,
        pdfBase64,
      });
      console.log(`[Brevo] Booking confirmation email dispatched to ${customerEmail}`);
    } catch (mailErr) {
      console.warn("[Brevo] Email dispatch warning (non-fatal):", mailErr);
    }

    return NextResponse.json({
      success: true,
      id: appointmentId,
      reference,
      secureToken,
      message: "Appointment confirmed and digital ticket emailed successfully.",
    });
  } catch (error: any) {
    console.error("[Book API] Server error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reserve appointment" },
      { status: 500 }
    );
  }
}
