import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secretKey, targetEmail, role } = body;

    const expectedSecret = process.env.DEV_SECRET_KEY || "gg-developer-2026-secret";

    if (!secretKey || secretKey !== expectedSecret) {
      return NextResponse.json({ success: false, error: "Unauthorized access" }, { status: 401 });
    }

    if (!targetEmail || !role) {
      return NextResponse.json({ success: false, error: "targetEmail and role are required" }, { status: 400 });
    }

    const validRoles = ["customer", "staff", "owner", "developer"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ success: false, error: `Invalid role: ${role}` }, { status: 400 });
    }

    const adminAuth = getAuth();
    const userRecord = await adminAuth.getUserByEmail(targetEmail);

    // Single owner check enforcement
    if (role === "owner") {
      const allUsers = await adminAuth.listUsers(100);
      const existingOwner = allUsers.users.find(
        (u) => u.customClaims?.role === "owner" && u.email?.toLowerCase() !== targetEmail.toLowerCase()
      );
      if (existingOwner) {
        return NextResponse.json(
          { success: false, error: `An owner already exists (${existingOwner.email}). Single owner constraint enforced.` },
          { status: 409 }
        );
      }
    }

    // Set custom user claim
    await adminAuth.setCustomUserClaims(userRecord.uid, { role });

    // Update or create document in Firestore users/customers
    if (adminDb) {
      const userRef = adminDb.collection("users").doc(userRecord.uid);
      await userRef.set(
        {
          role,
          email: targetEmail,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      // If staff, ensure entry exists in staff collection
      if (role === "staff") {
        const staffRef = adminDb.collection("staff").doc(userRecord.uid);
        await staffRef.set(
          {
            userId: userRecord.uid,
            isActive: true,
            services: [],
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Role '${role}' assigned to ${targetEmail} (UID: ${userRecord.uid})`,
    });
  } catch (error: any) {
    console.error("Set role error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
