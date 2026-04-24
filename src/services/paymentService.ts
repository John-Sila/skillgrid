import { collection, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase-config";

export const paymentService = {
  generateTransactionId: () => `TXN-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,

  createTransactionData: (invoiceId: string, bookingId: string, amount: number, clientId: string, providerId: string) => {
    return {
      invoiceId,
      bookingId,
      amount,
      transactionId: paymentService.generateTransactionId(),
      timestamp: serverTimestamp(),
      status: 'success' as const,
      clientId,
      providerId
    };
  }
};
