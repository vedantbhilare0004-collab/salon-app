import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database not initialized" }, { status: 500 });
    }

    // 1. Fetch all registered users
    const usersSnap = await adminDb.collection("users").get();
    const registeredUsers = usersSnap.docs.map((doc: any) => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: data.uid || doc.id,
        userId: data.userId || doc.id,
        fullName: data.fullName || data.name || "User",
        email: data.email || "",
        phone: data.phone || "",
        role: data.role || "customer",
        preferredBranch: data.preferredBranch || "koregaon",
        ownerBranch: data.ownerBranch,
        staffBranch: data.staffBranch,
        status: data.status || "active",
        createdAt: data.createdAt ? (typeof data.createdAt === "string" ? data.createdAt : data.createdAt.toDate?.()?.toISOString() || "") : "",
        updatedAt: data.updatedAt ? (typeof data.updatedAt === "string" ? data.updatedAt : data.updatedAt.toDate?.()?.toISOString() || "") : "",
      };
    });

    const totalRegisteredUsers = registeredUsers.length;
    const roleCounts = {
      customer: 0,
      staff: 0,
      owner: 0,
      developer: 0,
    };

    registeredUsers.forEach((u: any) => {
      const r = (u.role as keyof typeof roleCounts) || "customer";
      if (roleCounts[r] !== undefined) {
        roleCounts[r]++;
      } else {
        roleCounts.customer++;
      }
    });

    // 2. Fetch visitor analytics metrics
    const metricsDoc = await adminDb.collection("analytics").doc("site_metrics").get();
    const metricsData = metricsDoc.exists ? metricsDoc.data() || {} : {};

    const totalVisits = metricsData.totalVisits || 0;
    const totalUniqueVisitors = metricsData.totalUniqueVisitors || 0;
    const registeredVisitors = metricsData.registeredVisitors || 0;
    const unregisteredVisitors = metricsData.unregisteredVisitors || (totalUniqueVisitors - registeredVisitors);

    // 3. Fetch recent visitors
    const visitorsSnap = await adminDb
      .collection("site_visitors")
      .orderBy("lastSeenAt", "desc")
      .limit(50)
      .get()
      .catch(async () => {
        // Fallback without orderBy index if index is building
        return await adminDb.collection("site_visitors").limit(50).get();
      });

    const recentVisitors = visitorsSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalRegisteredUsers,
        roleCounts,
        registeredUsers,
        visitors: {
          totalUniqueVisitors,
          totalVisits,
          registeredVisitors,
          unregisteredVisitors: Math.max(0, unregisteredVisitors),
        },
        recentVisitors,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Developer metrics error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
