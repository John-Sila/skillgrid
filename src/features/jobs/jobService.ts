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
  deleteDoc,
  limit,
  runTransaction
} from 'firebase/firestore';
import { db, auth } from '../../firebase/config';
import { Booking, Provider, Category } from '../../shared/types';
import { handleFirestoreError, OperationType } from '../../firebase/utils';

export const jobService = {
  // Client Methods
  getBookings: (userId: string, role: 'client' | 'provider', callback: (bookings: Booking[]) => void) => {
    const path = 'bookings';
    const q = query(
      collection(db, path),
      where(role === 'client' ? 'clientId' : 'providerId', '==', userId),
      orderBy('date', 'desc')
    );
    return onSnapshot(q, (snap) => {
      const bookings = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      callback(bookings);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  createBooking: async (bookingData: Omit<Booking, 'id'>) => {
    const path = 'bookings';
    try {
      return await addDoc(collection(db, path), {
        ...bookingData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  updateBookingStatus: async (bookingId: string, status: Booking['status']) => {
    const path = `bookings/${bookingId}`;
    try {
      const ref = doc(db, 'bookings', bookingId);
      await updateDoc(ref, { status, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // Metadata Methods
  getCategories: (callback: (categories: any[]) => void) => {
    const path = 'categories';
    const q = query(collection(db, path), orderBy('label', 'asc'));
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  getTrendingProviders: (callback: (providers: Provider[]) => void) => {
    const path = 'users';
    const q = query(
      collection(db, path),
      where('role', '==', 'provider'),
      orderBy('reviews', 'desc'),
      limit(2)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Provider)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    });
  },

  // Provider Methods
  getProviders: async (category?: Category) => {
    const path = 'users';
    try {
      const q = category 
        ? query(collection(db, path), where('role', '==', 'provider'), where('category', '==', category))
        : query(collection(db, path), where('role', '==', 'provider'));
      
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Provider));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
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

  getProvider: async (id: string): Promise<Provider | null> => {
    const path = `users/${id}`;
    try {
      const docSnap = await getDoc(doc(db, 'users', id));
      if (docSnap.exists() && docSnap.data().role === 'provider') {
        return { id: docSnap.id, ...docSnap.data() } as Provider;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  updateProviderAvailability: async (providerId: string, isAvailable: boolean) => {
    const ref = doc(db, 'users', providerId);
    await updateDoc(ref, { isAvailable, lastAvailabilityUpdate: serverTimestamp() });
  },

  // Waitlist
  getWaitlist: (userId: string, role: 'client' | 'provider', callback: (entries: any[]) => void) => {
    const path = 'waitlist';
    const q = query(
      collection(db, path), 
      where(role === 'client' ? 'clientId' : 'providerId', '==', userId),
      orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  joinWaitlist: async (data: any) => {
    const path = 'waitlist';
    try {
      return await addDoc(collection(db, path), {
        ...data,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  addToWaitlist: async (providerId: string, tier: string) => {
    const path = 'waitlist';
    if (!auth.currentUser) throw new Error("Auth required");
    try {
      return await addDoc(collection(db, path), {
        clientId: auth.currentUser.uid,
        providerId,
        tier,
        status: 'active',
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  cancelWaitlistEntry: async (id: string) => {
    const path = `waitlist/${id}`;
    try {
      await deleteDoc(doc(db, 'waitlist', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  cancelBooking: async (id: string) => {
    const path = `bookings/${id}`;
    try {
      await deleteDoc(doc(db, 'bookings', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  markTaskCompleted: async (booking: Booking, providerName: string, clientName: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const bookingRef = doc(db, 'bookings', booking.id);
        const invoiceId = `INV-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const amount = booking.price;
        const platformFee = amount * 0.1;
        const total = amount + platformFee;

        const invoiceData = {
          invoiceId: invoiceId, // Correct field name as per generateInvoiceId usage elsewhere
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
        const invoiceRef = doc(collection(db, 'invoices'));
        transaction.set(invoiceRef, invoiceData);

        // 2. Update Booking Status
        transaction.update(bookingRef, { 
          status: 'completed', 
          updatedAt: serverTimestamp() 
        });

        // 3. Create Notification for Client
        const notificationRef = doc(collection(db, 'notifications'));
        transaction.set(notificationRef, {
          userId: booking.clientId,
          title: 'Invoice Generated',
          message: `Operational session with ${providerName} completed. Please review the e-invoice.`,
          type: 'invoice_sent',
          invoiceId,
          read: false,
          timestamp: serverTimestamp()
        });
      });
    } catch (error) {
      console.error("Task completion transaction failed:", error);
      throw error;
    }
  }
};
