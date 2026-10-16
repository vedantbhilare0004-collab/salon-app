import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Campaign } from "@/lib/types";

function toCampaign(id: string, data: Record<string, unknown>): Campaign {
  return { id, ...(data as Omit<Campaign, "id">) };
}

/**
 * Recursively strips `undefined` values from an object so Firestore
 * never receives unsupported field values.
 */
function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const clean = {} as Record<string, unknown>;
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      clean[key] = stripUndefined(value as Record<string, unknown>);
    } else {
      clean[key] = value;
    }
  }
  return clean as T;
}

export const campaignService = {
  async add(input: Omit<Campaign, "id">) {
    const db = getDb();
    const cleanInput = stripUndefined({
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Record<string, unknown>);
    const ref = await addDoc(collection(db, "campaigns"), cleanInput);
    return ref.id;
  },

  async update(id: string, patch: Partial<Campaign>) {
    const db = getDb();
    const cleanPatch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) {
        cleanPatch[key] = deleteField();
      } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        cleanPatch[key] = stripUndefined(value as Record<string, unknown>);
      } else {
        cleanPatch[key] = value;
      }
    }
    cleanPatch.updatedAt = new Date().toISOString();
    await updateDoc(doc(db, "campaigns", id), cleanPatch);
  },

  async get(id: string): Promise<Campaign | null> {
    const db = getDb();
    const snap = await getDoc(doc(db, "campaigns", id));
    if (!snap.exists()) return null;
    return toCampaign(snap.id, snap.data() as Record<string, unknown>);
  },

  async remove(id: string) {
    const db = getDb();
    await deleteDoc(doc(db, "campaigns", id));
  },

  onCampaigns(cb: (campaigns: Campaign[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "campaigns"), (snap) => {
      cb(snap.docs.map((d) => toCampaign(d.id, d.data() as Record<string, unknown>)));
    });
  },
};
