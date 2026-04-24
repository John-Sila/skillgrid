import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "../firebase-config";
import { type Booking } from "../App";

export const invoiceService = {
  generateInvoiceId: () => `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,

  createInvoiceData: (booking: Booking, providerName: string, clientName: string) => {
    const feePercent = 10;
    const platformFee = (booking.price * feePercent) / 100;
    const total = booking.price + platformFee;
    
    return {
      bookingId: booking.id,
      providerId: booking.providerId,
      clientId: booking.clientId,
      amount: booking.price,
      platformFee: platformFee,
      total: total,
      description: `${booking.category} Service Deployment - ${booking.time}`,
      status: 'sent' as const,
      timestamp: serverTimestamp(),
      providerName,
      clientName,
      invoiceId: invoiceService.generateInvoiceId()
    };
  }
};
