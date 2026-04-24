import { doc, serverTimestamp, collection, writeBatch, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { type Booking, type Invoice } from "../App";
import { invoiceService } from "./invoiceService";
import { paymentService } from "./paymentService";

export const workflowService = {
  // 1. Task Completion Trigger (Atomic)
  markTaskCompleted: async (booking: Booking, providerName: string, clientName: string) => {
    // Idempotency: Check current status from DB to prevent duplicate processing
    const bookingRef = doc(db, 'bookings', booking.id);
    const snap = await getDoc(bookingRef);
    if (!snap.exists()) throw new Error("Task not found");
    const currentBooking = snap.data() as Booking;
    
    if (currentBooking.status === 'completed' || currentBooking.status === 'paid' || currentBooking.status === 'closed') {
      console.warn("Task already completed or finalized.");
      return null;
    }

    if (currentBooking.status !== 'in_progress') {
      throw new Error("Task must be 'In Progress' to be completed.");
    }

    const batch = writeBatch(db);

    // Update Booking status
    batch.update(bookingRef, {
      status: 'completed',
      completionTimestamp: serverTimestamp()
    });

    // 2. Generate E-Invoice
    const invoiceData = invoiceService.createInvoiceData(booking, providerName, clientName);
    const invoiceRef = doc(collection(db, 'invoices'));
    batch.set(invoiceRef, invoiceData);

    // 3. Invoice Delivery Notifications
    const clientNotifRef = doc(collection(db, 'notifications'));
    batch.set(clientNotifRef, {
      userId: booking.clientId,
      title: "Invoice Generated",
      message: `Operational invoice for ${booking.category} is ready for approval. Total: Ksh ${invoiceData.total.toLocaleString()}`,
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

  // 4. Client Approval & Payment Flow (Atomic)
  approveInvoice: async (invoice: Invoice, bookingId: string) => {
    // Idempotency check
    const invoiceRef = doc(db, 'invoices', invoice.id);
    const bookingRef = doc(db, 'bookings', bookingId);
    
    const [invSnap, bookSnap] = await Promise.all([
      getDoc(invoiceRef),
      getDoc(bookingRef)
    ]);

    if (!invSnap.exists() || !bookSnap.exists()) throw new Error("Invoice or Booking not found");
    const currentInvoice = invSnap.data() as Invoice;
    
    if (currentInvoice.status === 'approved' || currentInvoice.status === 'paid') {
      console.warn("Invoice already approved or paid.");
      return null;
    }

    if (currentInvoice.status !== 'sent') return null;

    const batch = writeBatch(db);

    // Update Invoice & Booking
    batch.update(invoiceRef, { status: 'approved' });
    batch.update(bookingRef, { status: 'paid' });

    // 5. Automated Payment Execution
    const transactionData = paymentService.createTransactionData(
      invoice.id, 
      bookingId, 
      invoice.total, 
      invoice.clientId, 
      invoice.providerId
    );
    const txnRef = doc(collection(db, 'transactions'));
    batch.set(txnRef, transactionData);

    // Notify Provider
    const provNotifRef = doc(collection(db, 'notifications'));
    batch.set(provNotifRef, {
      userId: invoice.providerId,
      title: "Payment Disbursed",
      message: `Client approved invoice. Ksh ${invoice.amount.toLocaleString()} has been released to your terminal.`,
      type: 'payment_received',
      read: false,
      timestamp: serverTimestamp(),
      data: { bookingId, transactionId: transactionData.transactionId }
    });

    // 6. Schedule Closure
    batch.update(bookingRef, { status: 'closed' });

    await batch.commit();
    return transactionData.transactionId;
  },

  disputeInvoice: async (invoiceId: string, bookingId: string, userId: string, providerId: string) => {
    const batch = writeBatch(db);
    const invoiceRef = doc(db, 'invoices', invoiceId);
    const bookingRef = doc(db, 'bookings', bookingId);

    batch.update(invoiceRef, { status: 'disputed' });
    batch.update(bookingRef, { status: 'disputed' });

    // Notify Provider
    const notifRef = doc(collection(db, 'notifications'));
    batch.set(notifRef, {
      userId: providerId,
      title: "Dispute Flagged",
      message: `The client has raised a dispute regarding the recent deployment. Operational review pending.`,
      type: 'dispute_raised',
      read: false,
      timestamp: serverTimestamp(),
      data: { bookingId, invoiceId }
    });

    await batch.commit();
  }
};
