import { doc, updateDoc, addDoc, collection, serverTimestamp, getDoc, query, where, getDocs, orderBy, onSnapshot, writeBatch } from "firebase/firestore";
import { db, auth } from "../firebase-config";
import { type Booking, type Invoice } from "../App";

export const workflowService = {
  // 1. Task Completion Trigger
  markTaskCompleted: async (booking: Booking, providerName: string, clientName: string) => {
    if (booking.status !== 'in_progress') {
      throw new Error("Task must be 'In Progress' to be completed.");
    }

    const batch = writeBatch(db);
    const bookingRef = doc(db, 'bookings', booking.id);

    // Update Booking
    batch.update(bookingRef, {
      status: 'completed',
      completionTimestamp: serverTimestamp()
    });

    // 2. Automatic E-Invoice Generation
    const feePercent = 10;
    const platformFee = (booking.price * feePercent) / 100;
    const total = booking.price + platformFee;

    const invoiceId = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const invoiceRef = doc(collection(db, 'invoices'));
    
    batch.set(invoiceRef, {
      bookingId: booking.id,
      providerId: booking.providerId,
      clientId: booking.clientId,
      amount: booking.price,
      platformFee: platformFee,
      total: total,
      description: `${booking.category} Service Deployment - ${booking.time}`,
      status: 'sent',
      timestamp: serverTimestamp(),
      providerName: providerName,
      clientName: clientName,
      invoiceId: invoiceId
    });

    // 3. Invoice Delivery Notifications
    const clientNotifRef = doc(collection(db, 'notifications'));
    batch.set(clientNotifRef, {
      userId: booking.clientId,
      title: "Invoice Generated",
      message: `Operational invoice for ${booking.category} is ready for approval. Total: Ksh ${total.toLocaleString()}`,
      type: 'invoice_sent',
      read: false,
      timestamp: serverTimestamp(),
      data: { bookingId: booking.id, invoiceId: invoiceRef.id }
    });

    const providerNotifRef = doc(collection(db, 'notifications'));
    batch.set(providerNotifRef, {
      userId: booking.providerId,
      title: "Task Finalized",
      message: `Deployment cycle for ${booking.category} closed. Invoice delivered to client.`,
      type: 'task_completed',
      read: false,
      timestamp: serverTimestamp(),
      data: { bookingId: booking.id }
    });

    await batch.commit();
    return invoiceRef.id;
  },

  // 4. Client Approval Flow
  approveInvoice: async (invoice: Invoice, bookingId: string) => {
    if (invoice.status !== 'sent') return;

    const batch = writeBatch(db);
    const invoiceRef = doc(db, 'invoices', invoice.id);
    const bookingRef = doc(db, 'bookings', bookingId);

    // Update Invoice & Booking
    batch.update(invoiceRef, { status: 'approved' });
    batch.update(bookingRef, { status: 'paid' });

    // 5. Automated Payment Execution (Simulation)
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 12).toUpperCase()}`;
    const txnRef = doc(collection(db, 'transactions'));
    batch.set(txnRef, {
      invoiceId: invoice.id,
      bookingId: bookingId,
      amount: invoice.total,
      transactionId: transactionId,
      timestamp: serverTimestamp(),
      status: 'success',
      clientId: invoice.clientId,
      providerId: invoice.providerId
    });

    // Notify Provider
    const provNotifRef = doc(collection(db, 'notifications'));
    batch.set(provNotifRef, {
      userId: invoice.providerId,
      title: "Payment Disbursed",
      message: `Client approved invoice. Ksh ${invoice.amount.toLocaleString()} has been released to your terminal.`,
      type: 'payment_received',
      read: false,
      timestamp: serverTimestamp(),
      data: { bookingId, transactionId }
    });

    // 6. Schedule Closure
    batch.update(bookingRef, { status: 'closed' });

    await batch.commit();
    return transactionId;
  },

  disputeInvoice: async (invoiceId: string, bookingId: string, userId: string, providerId: string) => {
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const bookingRef = doc(db, 'bookings', bookingId);

    await updateDoc(invoiceRef, { status: 'disputed' });
    await updateDoc(bookingRef, { status: 'disputed' });

    // Notify Provider
    await addDoc(collection(db, 'notifications'), {
      userId: providerId,
      title: "Dispute Flagged",
      message: `The client has raised a dispute regarding the recent deployment. Operational review pending.`,
      type: 'dispute_raised',
      read: false,
      timestamp: serverTimestamp(),
      data: { bookingId, invoiceId }
    });
  }
};
