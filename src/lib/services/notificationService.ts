import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase";
import type { AppNotification, Role } from "@/lib/types";

function toNotification(id: string, data: Record<string, unknown>): AppNotification {
  return { id, ...(data as Omit<AppNotification, "id">) };
}

export const notificationService = {
  async deleteMultiple(_ids: string[]) {
    // In-app notifications removed.
  },
  async delete(_id: string) {
    // In-app notifications removed.
  },
  async create(_input: {
    recipientId?: string;
    recipientUid?: string;
    audience?: Role;
    branchId?: string;
    title: string;
    message: string;
    kind: AppNotification["kind"];
  }) {
    // In-app notification feature removed: no need to save in Firestore.
    return;
  },

  async markRead(_id: string) {
    // In-app notifications removed.
  },

  async markAllRead(_recipientId: string) {
    // In-app notifications removed.
  },

  onNotifications(
    _recipientId: string,
    _role: Role,
    cb: (list: AppNotification[]) => void
  ) {
    // In-app notifications removed: emit empty list and do not attach Firestore listeners.
    cb([]);
    return () => {};
  },
};
