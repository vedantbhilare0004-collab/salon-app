import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { BranchId, Role, User } from "@/lib/types";
import { generateUserId } from "@/lib/format";

function toUser(id: string, data: Record<string, unknown>): User {
  const role = (data.role as Role) || "customer";
  return { 
    uid: id,
    id: (data.userId as string) ?? id, 
    ...data, 
    fullName: (data.fullName as string) || "Guest",
    email: (data.email as string) || "",
    phone: (data.phone as string) || "",
    role 
  } as User;
}

export const userService = {
  async generateUniqueUserId(): Promise<string> {
    // Generate a random 10-character ID.
    // We cannot query the entire users collection from the client to check uniqueness 
    // due to Firestore security rules (only owners can read all users).
    // The collision probability is astronomically low anyway.
    return generateUserId();
  },

  async createUser(input: {
    uid: string;
    fullName: string;
    phone: string;
    email: string;
    preferredBranch: BranchId;
    role: Role;
  }): Promise<string> {
    const db = getDb();
    const userId = await this.generateUniqueUserId();
    const now = new Date().toISOString();
    // Document ID = Firebase Auth UID so rules can verify role via get(/users/$(uid)).
    await setDoc(doc(db, "users", input.uid), {
      uid: input.uid,
      userId,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      preferredBranch: input.preferredBranch,
      role: input.role,
      photoURL: "",
      status: "active",
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    return userId;
  },

  async addWalkInClient(input: {
    fullName: string;
    phone: string;
    email?: string;
    notes?: string;
    tags?: string[];
    gender?: string;
    birthday?: string;
    preferredBranch?: BranchId;
  }): Promise<string> {
    const db = getDb();
    const userId = await this.generateUniqueUserId();
    const newDocRef = doc(collection(db, "users"));
    const now = new Date().toISOString();
    await setDoc(newDocRef, {
      uid: newDocRef.id,
      userId,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email || "",
      preferredBranch: input.preferredBranch || "koregaon",
      role: "customer",
      photoURL: "",
      status: "active",
      active: true,
      notes: input.notes || "",
      tags: input.tags || ["Walk-in"],
      gender: input.gender || "",
      birthday: input.birthday || "",
      createdAt: now,
      updatedAt: now,
    });
    return userId;
  },

  async getUserByUid(uid: string): Promise<User | null> {
    const db = getDb();
    const d = await getDoc(doc(db, "users", uid));
    return d.exists() ? toUser(d.id, d.data() as Record<string, unknown>) : null;
  },

  async get(userId: string): Promise<User | null> {
    const db = getDb();
    const snap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return toUser(d.id, d.data() as Record<string, unknown>);
  },

  async updateUser(userId: string, patch: Partial<User>) {
    const db = getDb();
    const ref = await this.refFor(userId);
    if (ref) await updateDoc(ref, { ...patch, updatedAt: new Date().toISOString() });
  },

  async updateUserByUid(uid: string, patch: Partial<User>) {
    const db = getDb();
    await updateDoc(doc(db, "users", uid), { ...patch, updatedAt: new Date().toISOString() });
  },

  async refFor(userId: string) {
    const db = getDb();
    const snap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)));
    return snap.empty ? null : doc(db, "users", snap.docs[0].id);
  },

  async listUsers(): Promise<User[]> {
    const db = getDb();
    const snap = await getDocs(collection(db, "users"));
    return snap.docs.map((d) => toUser(d.id, d.data() as Record<string, unknown>));
  },

  onUsers(cb: (users: User[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "users"), (snap) => {
      cb(snap.docs.map((d) => toUser(d.id, d.data() as Record<string, unknown>)));
    });
  },

  onUser(uid: string, cb: (user: User | null) => void) {
    const db = getDb();
    return onSnapshot(doc(db, "users", uid), (d) => {
      if (d.exists()) cb(toUser(d.id, d.data() as Record<string, unknown>));
      else cb(null);
    });
  },

  async convertToStaff(
    userId: string,
    data: { branch: BranchId; position: string; services: string[] }
  ) {
    const ref = await this.refFor(userId);
    if (!ref) throw new Error("User not found");
    await updateDoc(ref, {
      role: "staff",
      staffBranch: data.branch,
      staffPosition: data.position,
      staffServices: data.services,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },

  async toggleStaffActive(userId: string) {
    let ref = await this.refFor(userId);
    if (!ref) {
      const db = getDb();
      ref = doc(db, "users", userId);
    }
    const d = await getDoc(ref);
    if (!d.exists()) return;
    const active = !(d.data()?.active as boolean);
    await updateDoc(ref, { active, updatedAt: new Date().toISOString() });
  },

  async createStaffMember(input: {
    fullName: string;
    phone: string;
    email?: string;
    branch: BranchId;
    position: string;
    services?: string[];
  }): Promise<string> {
    const db = getDb();
    const newDocRef = doc(collection(db, "users"));
    const userId = "STF" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const now = new Date().toISOString();
    await setDoc(newDocRef, {
      uid: newDocRef.id,
      userId,
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || "",
      preferredBranch: input.branch,
      role: "staff",
      staffBranch: input.branch,
      staffPosition: input.position.trim(),
      staffServices: input.services || [],
      photoURL: "",
      status: "active",
      active: true,
      createdAt: now,
      updatedAt: now,
    });
    return userId;
  },

  async removeStaff(userId: string, deletePermanently = false): Promise<void> {
    const db = getDb();
    let ref = await this.refFor(userId);
    if (!ref) {
      // Try document ID directly (for mock or seed records like staff_1, staff_2)
      const directRef = doc(db, "users", userId);
      const snap = await getDoc(directRef);
      if (snap.exists()) {
        ref = directRef;
      }
    }

    if (!ref) {
      console.warn(`[removeStaff] User not found for ID: ${userId}`);
      return;
    }

    if (deletePermanently) {
      await deleteDoc(ref);
    } else {
      await updateDoc(ref, {
        role: "customer",
        staffPosition: "",
        staffServices: [],
        active: true,
        updatedAt: new Date().toISOString(),
      });
    }
  },

  async saveFcmToken(uid: string, token: string) {
    const db = getDb();
    await updateDoc(doc(db, "users", uid), { fcmToken: token, updatedAt: new Date().toISOString() });
  },
};
