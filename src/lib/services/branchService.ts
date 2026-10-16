import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  setDoc,
  updateDoc,
  deleteDoc,
  increment,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Branch, BranchId } from "@/lib/types";

const BRANCH_SEED: Record<BranchId, Branch> = {
  koregaon: {
    id: "koregaon",
    name: "Koregaon",
    tagline: "Full-service beauty & unisex salon.",
    address: "Glow & Glamour Unisex Salon, Near ZP School, Laxmi Nagar, Koregaon, Maharashtra 415501",
    city: "Koregaon",
    phone: "+91 70582 39061",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Glow+and+Glamour+Koregaon",
    lat: 18.5362,
    lng: 73.8923,
    isOpen: true,
    availableChairs: 4,
    totalChairs: 6,
    openingTime: "09:30",
    closingTime: "21:00",
    averageServiceTime: 20,
    activeStaff: 4,
    workingHours: [
      { day: "Mon", open: "09:30", close: "21:00" },
      { day: "Tue", open: "09:30", close: "21:00" },
      { day: "Wed", open: "09:30", close: "21:00" },
      { day: "Thu", open: "09:30", close: "21:00" },
      { day: "Fri", open: "09:30", close: "21:00" },
      { day: "Sat", open: "09:00", close: "22:00" },
      { day: "Sun", open: "09:00", close: "20:00" },
    ],
  },
};

function toBranch(id: string, data: Record<string, unknown>): Branch {
  return { id: id as BranchId, ...(data as Omit<Branch, "id">) };
}

export const branchService = {
  async ensureBranches() {
    const db = getDb();
    for (const id of Object.keys(BRANCH_SEED) as BranchId[]) {
      const ref = doc(db, "branches", id);
      const snap = await getDoc(ref);
      await setDoc(ref, { ...BRANCH_SEED[id], updatedAt: new Date().toISOString() }, { merge: true });
    }
  },

  onBranches(cb: (branches: Branch[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "branches"), (snap) => {
      const list = snap.docs
        .map((d) => toBranch(d.id, d.data() as Record<string, unknown>))
        .filter((b) => b.id === "koregaon" || (b.name && b.name.trim().length > 0 && b.id !== "lhasurane"));
      cb(list);
    });
  },

  async updateBranch(id: BranchId, patch: Partial<Branch>) {
    const db = getDb();
    await updateDoc(doc(db, "branches", id), patch as Record<string, unknown>);
  },

  async addBranch(data: Partial<Branch>) {
    const db = getDb();
    const id = (data.id || data.name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || `branch_${Date.now()}`) as BranchId;
    const newBranch: Branch = {
      id,
      name: data.name || "New Branch",
      tagline: data.tagline || "Full-service salon branch.",
      address: data.address || "",
      city: data.city || "Koregaon",
      phone: data.phone || "",
      mapsUrl: data.mapsUrl || "",
      lat: data.lat || 18.5362,
      lng: data.lng || 73.8923,
      isOpen: data.isOpen ?? true,
      availableChairs: data.availableChairs ?? 4,
      totalChairs: data.totalChairs ?? 4,
      openingTime: data.openingTime || "09:30",
      closingTime: data.closingTime || "21:00",
      averageServiceTime: data.averageServiceTime || 20,
      activeStaff: data.activeStaff || 2,
      workingHours: data.workingHours || [
        { day: "Mon", open: "09:30", close: "21:00" },
        { day: "Tue", open: "09:30", close: "21:00" },
        { day: "Wed", open: "09:30", close: "21:00" },
        { day: "Thu", open: "09:30", close: "21:00" },
        { day: "Fri", open: "09:30", close: "21:00" },
        { day: "Sat", open: "09:00", close: "22:00" },
        { day: "Sun", open: "09:00", close: "20:00" },
      ],
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "branches", id), newBranch);
    return newBranch;
  },

  async deleteBranch(id: string) {
    const db = getDb();
    await deleteDoc(doc(db, "branches", id));
  },
};
