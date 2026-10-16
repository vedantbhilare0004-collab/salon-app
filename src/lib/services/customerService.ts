import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  addDoc
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Customer } from "@/lib/types";

function toCustomer(id: string, data: Record<string, unknown>): Customer {
  return { 
    id,
    name: (data.name as string) || "Guest",
    phone: (data.phone as string) || "",
    email: (data.email as string) || "",
    authUid: (data.authUid as string | null) || null,
    hasAccount: (data.hasAccount as boolean) || false,
    totalVisits: (data.totalVisits as number) || 0,
    totalSpending: (data.totalSpending as number) || 0,
    lastVisit: data.lastVisit as string | undefined,
    createdAt: (data.createdAt as string) || new Date().toISOString(),
    updatedAt: (data.updatedAt as string) || new Date().toISOString(),
  };
}

export const customerService = {
  // Use this for guest bookings or new users
  async findOrCreateCustomer(input: {
    phone: string;
    name: string;
    email?: string;
    authUid?: string | null;
  }): Promise<string> {
    const db = getDb();
    
    // Check if customer exists by phone
    const q = query(collection(db, "customers"), where("phone", "==", input.phone));
    const snap = await getDocs(q);
    
    const now = new Date().toISOString();
    
    if (!snap.empty) {
      // Customer exists, return ID and optionally update
      const docSnap = snap.docs[0];
      const existing = toCustomer(docSnap.id, docSnap.data());
      
      const updates: Partial<Customer> = { updatedAt: now };
      let needsUpdate = false;
      
      if (input.authUid && !existing.authUid) {
        updates.authUid = input.authUid;
        updates.hasAccount = true;
        needsUpdate = true;
      }
      if (input.name && existing.name === "Guest" && input.name !== "Guest") {
        updates.name = input.name;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await updateDoc(doc(db, "customers", docSnap.id), updates);
      }
      
      return docSnap.id;
    }
    
    // Create new customer
    const newCustomer = {
      name: input.name,
      phone: input.phone,
      email: input.email || "",
      authUid: input.authUid || null,
      hasAccount: !!input.authUid,
      totalVisits: 0,
      totalSpending: 0,
      createdAt: now,
      updatedAt: now,
    };
    
    const ref = await addDoc(collection(db, "customers"), newCustomer);
    return ref.id;
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const db = getDb();
    const d = await getDoc(doc(db, "customers", id));
    return d.exists() ? toCustomer(d.id, d.data()) : null;
  },

  async getCustomerByAuthUid(authUid: string): Promise<Customer | null> {
    const db = getDb();
    const snap = await getDocs(query(collection(db, "customers"), where("authUid", "==", authUid)));
    if (snap.empty) return null;
    const d = snap.docs[0];
    return toCustomer(d.id, d.data());
  },

  async updateCustomer(id: string, patch: Partial<Customer>) {
    const db = getDb();
    await updateDoc(doc(db, "customers", id), { ...patch, updatedAt: new Date().toISOString() });
  },

  onCustomers(cb: (customers: Customer[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "customers"), (snap) => {
      cb(snap.docs.map((d) => toCustomer(d.id, d.data())));
    });
  }
};
