import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Service, BranchId } from "@/lib/types";
import { NEW_CATALOGUE, generateCatalogueServiceId, getCategoryImageUrl } from "@/lib/catalogue-data";

function toService(id: string, data: Record<string, unknown>): Service {
  return { id, ...(data as Omit<Service, "id">) };
}

export const RAW_SERVICES = NEW_CATALOGUE.map((item) => ({
  name: item.name,
  price: item.price,
  durationMin: item.durationMin,
  category: item.category,
  gender: item.gender,
  variant: item.variant,
  imageUrl: getCategoryImageUrl(item.category, item.gender),
  active: true,
}));

export const serviceService = {
  async add(input: Omit<Service, "id">) {
    const db = getDb();
    const ref = await addDoc(collection(db, "services"), input);
    return ref.id;
  },

  async update(id: string, patch: Partial<Service>) {
    const db = getDb();
    await updateDoc(doc(db, "services", id), {
      ...patch,
      updatedAt: new Date().toISOString(),
    } as Record<string, unknown>);
  },

  async remove(id: string) {
    const db = getDb();
    await deleteDoc(doc(db, "services", id));
  },

  onServices(cb: (services: Service[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "services"), (snap) => {
      const all = snap.docs.map((d) => toService(d.id, d.data() as Record<string, unknown>));
      cb(all);
    });
  },

  async cleanupDuplicates() {
    const db = getDb();
    const snap = await getDocs(collection(db, "services"));
    const all = snap.docs.map((d) => toService(d.id, d.data() as Record<string, unknown>));
    const seen = new Set<string>();
    for (const s of all) {
      if (s.archived) continue; // Keep archived historical records safe
      const key = `${s.name.trim().toLowerCase()}-${s.branchId}-${s.category}-${s.gender || ""}-${s.variant || ""}`;
      if (seen.has(key)) {
        try {
          await deleteDoc(doc(db, "services", s.id));
        } catch (e) {
          console.error("Failed to delete duplicate service:", e);
        }
      } else {
        seen.add(key);
      }
    }
  },

  async ensureServices(currentRole: string, uid: string, updateUserRole: (uid: string, role: string) => Promise<void>) {
    const db = getDb();
    const existing = await getDocs(collection(db, "services"));
    const activeDocs = existing.docs.filter((d) => {
      const data = d.data();
      return data.active === true && !data.archived;
    });

    if (activeDocs.length === 0) {
      if (currentRole !== "owner") {
        await updateUserRole(uid, "owner");
        await new Promise((r) => setTimeout(r, 2000));
      }
      const branches: BranchId[] = ["koregaon"];
      for (const branch of branches) {
        for (const item of NEW_CATALOGUE) {
          const docId = generateCatalogueServiceId({ ...item, branchId: branch });
          await setDoc(doc(db, "services", docId), {
            branchId: branch,
            category: item.category,
            name: item.name,
            price: item.price,
            durationMin: item.durationMin,
            durationMinutes: item.durationMin,
            gender: item.gender || "unisex",
            variant: item.variant || null,
            active: true,
            isActive: true,
            archived: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
      if (currentRole !== "owner") {
        await updateUserRole(uid, currentRole);
      }
    }
  },
};
