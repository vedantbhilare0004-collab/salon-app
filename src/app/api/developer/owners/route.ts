import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { adminDb } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    const usersSnap = await adminDb.collection("users").get();
    const allUsers = usersSnap.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const owners = allUsers.filter((u: any) => u.role === "owner");
    const totalUsers = allUsers.length;

    return NextResponse.json({
      success: true,
      owners,
      totalUsers,
    });
  } catch (error: any) {
    console.error("Developer owners GET error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, uid, fullName, phone, password, branchId } = body;

    const adminAuth = getAuth();
    if (!adminDb) {
      return NextResponse.json({ success: false, error: "Database unavailable" }, { status: 500 });
    }

    // 1. ASSIGN OWNER ROLE
    if (action === "assign") {
      let targetUserRecord;
      if (uid) {
        targetUserRecord = await adminAuth.getUser(uid);
      } else if (email) {
        targetUserRecord = await adminAuth.getUserByEmail(email.trim().toLowerCase());
      } else {
        return NextResponse.json({ success: false, error: "Email or UID required" }, { status: 400 });
      }

      const targetEmail = targetUserRecord.email?.toLowerCase();
      if (targetEmail === "prathmeshbhilare52@gmail.com") {
        return NextResponse.json({ success: false, error: "Cannot modify primary Developer role" }, { status: 400 });
      }

      await adminAuth.setCustomUserClaims(targetUserRecord.uid, {
        ...targetUserRecord.customClaims,
        role: "owner",
      });

      const userDocRef = adminDb.collection("users").doc(targetUserRecord.uid);
      await userDocRef.set(
        {
          role: "owner",
          ownerBranch: branchId || "koregaon",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return NextResponse.json({
        success: true,
        message: `Assigned Owner role to ${targetUserRecord.displayName || targetUserRecord.email} successfully.`,
      });
    }

    // 2. REMOVE / DEMOTE OWNER
    if (action === "remove") {
      let targetUserRecord;
      if (uid) {
        targetUserRecord = await adminAuth.getUser(uid);
      } else if (email) {
        targetUserRecord = await adminAuth.getUserByEmail(email.trim().toLowerCase());
      } else {
        return NextResponse.json({ success: false, error: "Email or UID required" }, { status: 400 });
      }

      const targetEmail = targetUserRecord.email?.toLowerCase();
      if (targetEmail === "prathmeshbhilare52@gmail.com") {
        return NextResponse.json({ success: false, error: "Cannot demote or remove the Developer account." }, { status: 403 });
      }

      await adminAuth.setCustomUserClaims(targetUserRecord.uid, {
        ...targetUserRecord.customClaims,
        role: "customer",
      });

      const userDocRef = adminDb.collection("users").doc(targetUserRecord.uid);
      await userDocRef.set(
        {
          role: "customer",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      return NextResponse.json({
        success: true,
        message: `Owner role removed from ${targetUserRecord.displayName || targetUserRecord.email}. Account returned to Customer.`,
      });
    }

    // 3. CREATE NEW OWNER ACCOUNT
    if (action === "create") {
      if (!email || !fullName) {
        return NextResponse.json({ success: false, error: "Email and Full Name are required" }, { status: 400 });
      }

      const cleanEmail = email.trim().toLowerCase();
      const defaultPassword = password || "Owner@" + Math.random().toString(36).slice(-6) + "!";

      let userRecord;
      try {
        userRecord = await adminAuth.getUserByEmail(cleanEmail);
      } catch {
        // User does not exist, create in Auth
        userRecord = await adminAuth.createUser({
          email: cleanEmail,
          password: defaultPassword,
          displayName: fullName,
        });
      }

      await adminAuth.setCustomUserClaims(userRecord.uid, {
        ...userRecord.customClaims,
        role: "owner",
      });

      const randomUserId = "OWN-" + userRecord.uid.slice(0, 6).toUpperCase();
      const now = new Date().toISOString();

      await adminDb.collection("users").doc(userRecord.uid).set(
        {
          uid: userRecord.uid,
          userId: randomUserId,
          fullName: fullName,
          email: cleanEmail,
          phone: phone || "",
          role: "owner",
          ownerBranch: branchId || "koregaon",
          preferredBranch: branchId || "koregaon",
          status: "active",
          active: true,
          createdAt: now,
          updatedAt: now,
        },
        { merge: true }
      );

      return NextResponse.json({
        success: true,
        message: `Owner ${fullName} created and assigned successfully.`,
        credentials: {
          email: cleanEmail,
          password: password ? undefined : defaultPassword,
        },
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Developer owners POST error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
