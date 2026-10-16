import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { sendBrevoEmail } from "@/lib/brevoEmailService";

export const dynamic = "force-dynamic";

/**
 * Calculates India Standard Time (IST, UTC+5:30) date string "YYYY-MM-DD" and current hour.
 */
function getISTDateAndHour(): { todayStr: string; currentHourIST: number } {
  const now = new Date();
  const istFormatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = istFormatter.format(now); // "YYYY-MM-DD"

  const hourFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    hour12: false,
  });
  const currentHourIST = parseInt(hourFormatter.format(now), 10);

  return { todayStr, currentHourIST };
}

export async function GET(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json(
        { success: false, error: "Firebase Admin Database not initialized" },
        { status: 500 }
      );
    }

    const { todayStr, currentHourIST } = getISTDateAndHour();
    const activeStatuses = ["Booked", "Confirmed", "In Progress", "pending", "confirmed", "in_service", "checked_in"];

    // Query all appointments that could be expired
    const snapshot = await adminDb.collection("appointments").get();
    let updatedCount = 0;
    const batch = adminDb.batch();

    const notificationsToSend: Array<{ toEmail: string; customerName: string; reference: string }> = [];

    snapshot.forEach((doc: any) => {
      const data = doc.data();
      if (!activeStatuses.includes(data.status)) return;

      const apptDate = data.date;
      const isPastDate = apptDate < todayStr;
      const isSameDayPastClosing = apptDate === todayStr && currentHourIST >= 20;

      if (isPastDate || isSameDayPastClosing) {
        batch.update(doc.ref, {
          status: "no_show",
          updatedAt: new Date().toISOString(),
          autoCancelledReason: isPastDate ? "Past date expired" : "Salon closed at 8:00 PM IST",
        });
        updatedCount += 1;

        if (data.customerEmail || data.email) {
          notificationsToSend.push({
            toEmail: data.customerEmail || data.email,
            customerName: data.customerName || "Valued Client",
            reference: data.reference || doc.id,
          });
        }
      }
    });

    if (updatedCount > 0) {
      await batch.commit();
    }

    // Dispatch polite notifications (fail-soft)
    for (const notif of notificationsToSend) {
      sendBrevoEmail({
        toEmail: notif.toEmail,
        toName: notif.customerName,
        subject: `Update on your Salon Booking (#${notif.reference}) — Glow & Glamour`,
        htmlContent: `
          <div style="font-family: sans-serif; padding: 20px; color: #2B2B2B;">
            <h2>Glow &amp; Glamour Hair Studio</h2>
            <p>Dear ${notif.customerName},</p>
            <p>Our salon sanctuary has now concluded operations for today. As your scheduled appointment (#${notif.reference}) was not completed, it has been marked as a No Show.</p>
            <p>We invite you to reserve your next preferred appointment anytime at your convenience on our website.</p>
            <p>Warm regards,<br/>The Glow &amp; Glamour Team<br/>Koregaon</p>
          </div>
        `,
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      processedAtIST: todayStr,
      currentHourIST,
      noShowUpdatedCount: updatedCount,
    });
  } catch (error: any) {
    console.error("Auto-cancel cron error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
