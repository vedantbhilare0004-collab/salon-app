import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Offer } from "@/lib/types";

function toOffer(id: string, data: Record<string, unknown>): Offer {
  return { id, ...(data as Omit<Offer, "id">) };
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

export const offerService = {
  async add(input: Omit<Offer, "id">) {
    const db = getDb();
    const cleanInput = stripUndefined(input as unknown as Record<string, unknown>);
    const ref = await addDoc(collection(db, "offers"), cleanInput);
    return ref.id;
  },

  async update(id: string, patch: Partial<Offer>) {
    const db = getDb();
    // For update, fields set to undefined should be removed from the doc
    const cleanPatch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) {
        // Use deleteField() to remove the field from Firestore
        cleanPatch[key] = deleteField();
      } else if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        cleanPatch[key] = stripUndefined(value as Record<string, unknown>);
      } else {
        cleanPatch[key] = value;
      }
    }
    await updateDoc(doc(db, "offers", id), cleanPatch);
  },

  async get(id: string): Promise<Offer | null> {
    const db = getDb();
    const { getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "offers", id));
    if (!snap.exists()) return null;
    return toOffer(snap.id, snap.data() as Record<string, unknown>);
  },

  async remove(id: string) {
    const db = getDb();
    await deleteDoc(doc(db, "offers", id));
  },

  onOffers(cb: (offers: Offer[]) => void) {
    const db = getDb();
    return onSnapshot(collection(db, "offers"), (snap) => {
      cb(snap.docs.map((d) => toOffer(d.id, d.data() as Record<string, unknown>)));
    });
  },
};
