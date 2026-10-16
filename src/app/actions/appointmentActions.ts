"use server";

import { adminDb } from "@/lib/firebase-admin";
import type { Appointment, AppointmentStatus, BranchId } from "@/lib/types";
import { sendBookingConfirmationEmail } from "@/lib/brevoEmailService";
import { generateBookingTicketPdf } from "@/lib/ticketService";

// Helper to generate a random secure token for guest bookings
function generateSecureToken() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function createGuestAppointment(data: {
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  branchId: BranchId | string;
  serviceIds: string[];
  date: string;
  time: string;
  notes?: string;
  assignedStaffId?: string;
  priceAtBooking?: number;
}): Promise<{ success: boolean; id?: string; secureToken?: string; reference?: string; error?: string }> {
  try {
    if (!adminDb) {
      throw new Error("Firebase Admin not initialized");
    }

    const secureToken = generateSecureToken();
    const reference = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit ref
    const now = new Date().toISOString();

    const appointment = {
      reference,
      customerId: data.customerId || "guest",
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail || null,
      branchId: data.branchId || "koregaon",
      serviceIds: data.serviceIds,
      serviceId: data.serviceIds[0] || null,
      date: data.date,
      time: data.time,
      startTime: data.time,
      status: "pending" as AppointmentStatus,
      isWalkIn: false,
      token: null,
      secureToken,
      priceAtBooking: data.priceAtBooking || 0,
      createdAt: now,
      updatedAt: now,
      notes: data.notes || "",
      assignedStaffId: data.assignedStaffId || null,
      staffId: data.assignedStaffId || null,
      source: "website",
    };

    const docRef = await adminDb.collection("appointments").add(appointment);

    // Optional fail-soft Brevo email confirmation
    if (data.customerEmail) {
      try {
        const { base64 } = await generateBookingTicketPdf({
          appointment: { id: docRef.id, ...appointment } as Appointment,
        });

        await sendBookingConfirmationEmail({
          toEmail: data.customerEmail,
          customerName: data.customerName,
          appointmentId: docRef.id,
          reference,
          serviceName: "Salon Treatment",
          date: data.date,
          time: data.time,
          pdfBase64: base64,
        });
      } catch (mailErr) {
        console.warn("Mail dispatch skipped:", mailErr);
      }
    }

    return {
      success: true,
      id: docRef.id,
      reference,
      secureToken,
    };
  } catch (error: any) {
    console.error("Error creating guest appointment:", error);
    return { success: false, error: error.message };
  }
}

export async function createBooking(data: {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  branchId?: "koregaon";
  serviceIds: string[];
  date: string;
  startTime: string;
  notes?: string;
  assignedStaffId?: string;
  priceAtBooking?: number;
  customerRole?: string;
}) {
  return createGuestAppointment({
    customerId: data.customerId || "guest",
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    customerEmail: data.customerEmail,
    branchId: "koregaon",
    serviceIds: data.serviceIds,
    date: data.date,
    time: data.startTime,
    notes: data.notes,
    assignedStaffId: data.assignedStaffId,
    priceAtBooking: data.priceAtBooking,
  });
}

export async function getAppointmentBySecureToken(token: string): Promise<Appointment | null> {
  try {
    if (!adminDb) return null;

    const snap = await adminDb
      .collection("appointments")
      .where("secureToken", "==", token)
      .limit(1)
      .get();

    if (snap.empty) return null;

    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() } as Appointment;
  } catch (error) {
    console.error("Error fetching appointment by token:", error);
    return null;
  }
}
