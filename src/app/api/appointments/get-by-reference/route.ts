import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import type { Appointment } from "@/lib/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");
    const token = searchParams.get("token");

    if (!reference) {
      return NextResponse.json({ success: false, error: "Missing reference parameter" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
    }

    const snap = await adminDb
      .collection("appointments")
      .where("reference", "==", reference)
      .limit(1)
      .get();

    if (snap.empty) {
      return NextResponse.json({ success: false, error: "Appointment not found" }, { status: 404 });
    }

    const doc = snap.docs[0];
    const data = doc.data() as Omit<Appointment, "id">;
    const appointment: Appointment = {
      id: doc.id,
      ...data,
    };

    // If guest, validate token
    if (appointment.customerId === "guest" && appointment.secureToken && appointment.secureToken !== token) {
      return NextResponse.json({ success: false, error: "Invalid security token" }, { status: 403 });
    }

    return NextResponse.json({ success: true, appointment });
  } catch (error: any) {
    console.error("[Get By Reference API] Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to load appointment" }, { status: 500 });
  }
}
