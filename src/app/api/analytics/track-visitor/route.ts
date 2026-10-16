import { NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database not initialized" }, { status: 500 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: "Empty or invalid JSON body" }, { status: 400 });
    }
    const { visitorId, pathname, isRegistered, uid, email, role } = body;

    if (!visitorId) {
      return NextResponse.json({ success: false, error: "visitorId is required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const todayKey = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const visitorRef = adminDb.collection("site_visitors").doc(visitorId);
    const metricsRef = adminDb.collection("analytics").doc("site_metrics");

    const visitorDoc = await visitorRef.get();

    if (!visitorDoc.exists) {
      // First time this unique visitor is seen
      await visitorRef.set({
        visitorId,
        isRegistered: !!isRegistered,
        uid: uid || null,
        email: email || null,
        role: role || (isRegistered ? "registered" : "guest"),
        firstSeenAt: now,
        lastSeenAt: now,
        pageViews: 1,
        lastPath: pathname || "/",
      });

      await metricsRef.set(
        {
          totalVisits: FieldValue.increment(1),
          totalUniqueVisitors: FieldValue.increment(1),
          registeredVisitors: isRegistered ? FieldValue.increment(1) : FieldValue.increment(0),
          unregisteredVisitors: !isRegistered ? FieldValue.increment(1) : FieldValue.increment(0),
          [`dailyVisits_${todayKey}`]: FieldValue.increment(1),
          lastUpdated: now,
        },
        { merge: true }
      );
    } else {
      // Returning visitor
      const prevData = visitorDoc.data() || {};
      const wasRegistered = prevData.isRegistered;
      const nowRegistered = !!isRegistered;

      // If user converted from guest to registered in the same session/cookie
      const statusPromoted = !wasRegistered && nowRegistered;

      await visitorRef.update({
        isRegistered: wasRegistered || nowRegistered,
        uid: uid || prevData.uid || null,
        email: email || prevData.email || null,
        role: role || prevData.role || (nowRegistered ? "registered" : "guest"),
        lastSeenAt: now,
        pageViews: FieldValue.increment(1),
        lastPath: pathname || prevData.lastPath || "/",
      });

      const metricsUpdate: Record<string, any> = {
        totalVisits: FieldValue.increment(1),
        [`dailyVisits_${todayKey}`]: FieldValue.increment(1),
        lastUpdated: now,
      };

      if (statusPromoted) {
        metricsUpdate.registeredVisitors = FieldValue.increment(1);
        metricsUpdate.unregisteredVisitors = FieldValue.increment(-1);
      }

      await metricsRef.set(metricsUpdate, { merge: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Track visitor error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
