import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { getDb, isFirebaseConfigured } from "../firebase";
import { todayISO } from "../format";
import type { AttendanceShift } from "../types";

const COLLECTION_NAME = "attendance_shifts";

export const attendanceService = {
  /**
   * Retrieves today's attendance shift for the specified staff member.
   */
  async getTodayShift(staffId: string): Promise<AttendanceShift | null> {
    if (!isFirebaseConfigured) return null;
    try {
      const db = getDb();
      const today = todayISO();
      const q = query(
        collection(db, COLLECTION_NAME),
        where("staffId", "==", staffId),
        where("date", "==", today),
        limit(1)
      );
      const snap = await getDocs(q);
      if (snap.empty) return null;
      const d = snap.docs[0];
      return { id: d.id, ...d.data() } as AttendanceShift;
    } catch (err) {
      console.error("Error getting today shift:", err);
      return null;
    }
  },

  /**
   * Clocks in the staff member for today's shift.
   */
  async clockIn(staffId: string, staffName?: string): Promise<AttendanceShift> {
    const today = todayISO();
    const existing = await this.getTodayShift(staffId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const shiftData = {
      staffId,
      staffName: staffName || "Stylist",
      date: today,
      clockInTime: now,
      status: "Active" as const,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseConfigured) {
      try {
        const db = getDb();
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
          ...shiftData,
          clockInTimestamp: serverTimestamp(),
        });
        return { id: docRef.id, ...shiftData };
      } catch (e) {
        console.error("Error creating shift doc:", e);
      }
    }

    return { id: `local-${Date.now()}`, ...shiftData };
  },

  /**
   * Clocks out from the active shift.
   */
  async clockOut(shiftId: string): Promise<void> {
    const now = new Date().toISOString();
    if (isFirebaseConfigured) {
      try {
        const db = getDb();
        const docRef = doc(db, COLLECTION_NAME, shiftId);
        await updateDoc(docRef, {
          clockOutTime: now,
          status: "Completed",
          updatedAt: now,
          clockOutTimestamp: serverTimestamp(),
        });
        return;
      } catch (e) {
        console.error("Error updating shift clock out:", e);
      }
    }
  },
};
