import { doc, getDoc, updateDoc, serverTimestamp, type DocumentReference } from "firebase/firestore";
import { db } from "../firebase-config";
import { type Booking } from "../App";

export const taskService = {
  getTask: async (taskId: string) => {
    const docRef = doc(db, 'bookings', taskId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error("Task not found");
    return { id: snap.id, ...snap.data() } as Booking;
  },

  updateStatus: async (taskId: string, status: Booking['status']) => {
    const docRef = doc(db, 'bookings', taskId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
  }
};
