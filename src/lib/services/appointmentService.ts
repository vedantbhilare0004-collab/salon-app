import {
  addDoc,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { Appointment } from "@/lib/types";

function toAppointment(id: string, data: Record<string, unknown>): Appointment {
  const { id: _ignored, ...rest } = data;
  return { id, ...(rest as Omit<Appointment, "id">) };
}

export const appointmentService = {
  async add(input: Omit<Appointment, "id">) {
    const db = getDb();
    const docData = { ...input } as any;
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) delete docData[key];
    });
    const ref = await addDoc(collection(db, "appointments"), docData);
    return ref.id;
  },

  async update(id: string, patch: Partial<Appointment>) {
    const db = getDb();
    const docData = { ...patch } as any;
    Object.keys(docData).forEach((key) => {
      if (docData[key] === undefined) delete docData[key];
    });
    await updateDoc(doc(db, "appointments", id), docData);
  },

  async delete(id: string) {
    const db = getDb();
    await deleteDoc(doc(db, "appointments", id));
  },

  onAppointments(role: string, uid: string, branchId: string | null, cb: (appointments: Appointment[]) => void) {
    const db = getDb();
    let q = query(collection(db, "appointments"));
    
    if (role === "customer") {
      q = query(q, where("customerUid", "==", uid));
    } else if (role === "staff" && branchId) {
      q = query(q, where("branchId", "==", branchId));
    }
    
    return onSnapshot(
      q,
      (snap) => {
        const nowMs = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        const validAppointments = snap.docs
          .map((d) => toAppointment(d.id, d.data() as Record<string, unknown>))
          .filter((a) => a.id && a.id.trim() !== "")
          .filter((a) => {
            const isTerminal = ["completed", "cancelled", "rejected", "no_show"].includes(a.status);
            if (!isTerminal) return true;

            let timeToCompare = a.completedAt ? new Date(a.completedAt).getTime() : NaN;
            if (isNaN(timeToCompare)) {
              timeToCompare = new Date(`${a.date}T${a.time}:00`).getTime();
            }
            if (isNaN(timeToCompare)) {
              timeToCompare = new Date(a.date).getTime();
            }
            if (isNaN(timeToCompare)) return true;

            if (nowMs - timeToCompare > TWENTY_FOUR_HOURS) {
              appointmentService.delete(a.id).catch((err) => console.error("Auto-delete failed:", err));
              return false;
            }
            return true;
          });

        cb(validAppointments);
      },
      (error) => {
        console.error("onAppointments error:", error);
      }
    );
  },

  async getByDate(branchId: string, date: string): Promise<Appointment[]> {
    try {
      const db = getDb();
      const q = query(
        collection(db, "appointments"),
        where("branchId", "==", branchId),
        where("date", "==", date)
      );
      const { getDocs } = await import("firebase/firestore");
      const snap = await getDocs(q);
      return snap.docs.map(d => toAppointment(d.id, d.data() as Record<string, unknown>));
    } catch {
      // Permission denied or unauthenticated guest: return empty list to fallback to default slots
      return [];
    }
  },

  async getByReference(reference: string, token?: string): Promise<Appointment | null> {
    // 1. Try server endpoint first (has admin access and bypasses client permission rules)
    try {
      const res = await fetch(`/api/appointments/get-by-reference?reference=${encodeURIComponent(reference)}&token=${encodeURIComponent(token || "")}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.appointment) {
          return json.appointment as Appointment;
        }
      }
    } catch {
      // Fallback to client SDK if fetch fails
    }

    try {
      const db = getDb();
      const q = query(
        collection(db, "appointments"),
        where("reference", "==", reference)
      );
      const { getDocs } = await import("firebase/firestore");
      const snap = await getDocs(q);
      if (snap.empty) return null;
      return toAppointment(snap.docs[0].id, snap.docs[0].data() as Record<string, unknown>);
    } catch {
      return null;
    }
  },
};
