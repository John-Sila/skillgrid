import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  getDocs,
  getDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Booking, Provider, Category } from '../../shared/types';

export const jobService = {
  // Client Methods
  getBookings: (userId: string, role: 'client' | 'provider', callback: (bookings: Booking[]) => void) => {
    const q = query(
      collection(db, 'bookings'),
      where(role === 'client' ? 'clientId' : 'providerId', '==', userId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      callback(bookings);
    });
  },

  createBooking: async (bookingData: Omit<Booking, 'id'>) => {
    return addDoc(collection(db, 'bookings'), {
      ...bookingData,
      status: 'pending',
      createdAt: serverTimestamp()
    });
  },

  updateBookingStatus: async (bookingId: string, status: Booking['status']) => {
    const ref = doc(db, 'bookings', bookingId);
    await updateDoc(ref, { status, updatedAt: serverTimestamp() });
  },

  // Provider Methods
  getProviders: async (category?: Category) => {
    const q = category 
      ? query(collection(db, 'users'), where('role', '==', 'provider'), where('category', '==', category))
      : query(collection(db, 'users'), where('role', '==', 'provider'));
    
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Provider));
  },

  getAvailableProviders: async (category: Category) => {
    const q = query(
      collection(db, 'users'), 
      where('role', '==', 'provider'), 
      where('category', '==', category),
      where('isAvailable', '==', true)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Provider));
  },

  updateProviderAvailability: async (providerId: string, isAvailable: boolean) => {
    const ref = doc(db, 'users', providerId);
    await updateDoc(ref, { isAvailable, lastAvailabilityUpdate: serverTimestamp() });
  },

  // Waitlist
  getWaitlist: (callback: (entries: any[]) => void) => {
    const q = query(collection(db, 'waitlist'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  },

  joinWaitlist: async (data: any) => {
    return addDoc(collection(db, 'waitlist'), {
      ...data,
      timestamp: serverTimestamp()
    });
  },

  addToWaitlist: async (providerId: string, tier: string) => {
    return addDoc(collection(db, 'waitlist'), {
      providerId,
      tier,
      timestamp: serverTimestamp()
    });
  },

  markTaskCompleted: async (booking: Booking, providerName: string, clientName: string) => {
    const bookingRef = doc(db, 'bookings', booking.id);
    const invoiceId = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const amount = booking.price;
    const platformFee = amount * 0.1;
    const total = amount + platformFee;

    const invoiceData = {
      id: invoiceId,
      bookingId: booking.id,
      clientId: booking.clientId,
      providerId: booking.providerId,
      providerName,
      clientName,
      description: `${booking.category} Service Deployment`,
      amount,
      platformFee,
      total,
      status: 'pending',
      timestamp: serverTimestamp()
    };

    // 1. Create Invoice
    await addDoc(collection(db, 'invoices'), invoiceData);

    // 2. Update Booking Status
    await updateDoc(bookingRef, { status: 'completed', updatedAt: serverTimestamp() });

    // 3. Create Notification for Client
    await addDoc(collection(db, 'notifications'), {
      userId: booking.clientId,
      title: 'Invoice Generated',
      message: `Operational session with ${providerName} completed. Please review the e-invoice.`,
      type: 'invoice_sent',
      invoiceId,
      read: false,
      timestamp: serverTimestamp()
    });
  }
};
