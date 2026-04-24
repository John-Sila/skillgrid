import { 
  onAuthStateChanged, 
  signOut, 
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { UserRole } from '../../shared/types';

export const authService = {
  onAuthStateChange: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => auth.currentUser,

  login: (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signup: (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  logout: () => {
    return signOut(auth);
  },

  sendEmailVerification: (user: FirebaseUser) => {
    return sendEmailVerification(user);
  },

  sendPasswordReset: (email: string) => {
    return sendPasswordResetEmail(auth, email);
  },

  getUserProfile: async (uid: string) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
  },

  saveUserProfile: async (uid: string, profile: any) => {
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...profile,
      updatedAt: serverTimestamp()
    }, { merge: true });
  }
};
