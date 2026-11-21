// Al Zaydan CRM - Automated Firebase Auth & Firestore User Management Service
import { initializeApp, deleteApp } from 'firebase/app';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  getAuth
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where
} from 'firebase/firestore';
import { auth, db, firebaseConfig } from '../config/firebase';
import { CANONICAL_SYSTEM_USERS } from '../utils/userDirectory';

/**
 * Automatically create a new user in Firebase Authentication & Firestore.
 * Uses an isolated secondary Firebase app instance so the currently logged-in
 * admin is NEVER logged out during employee creation.
 */
export async function createFirebaseUser({ email, password, userData }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = (password || '').trim();

  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Email and password are required' };
  }

  let secondaryApp = null;
  try {
    // 1. Create temporary secondary app instance for isolated user registration
    const appName = `UserCreator_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    secondaryApp = initializeApp(firebaseConfig, appName);
    const secondaryAuth = getAuth(secondaryApp);

    // 2. Register account in Firebase Authentication
    let uid = null;
    try {
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, cleanPassword);
      uid = userCredential.user.uid;
      await signOut(secondaryAuth);
    } catch (authErr) {
      if (authErr.code === 'auth/email-already-in-use') {
        console.info(`User ${cleanEmail} already exists in Firebase Auth, updating Firestore profile.`);
      } else {
        console.warn('Firebase Auth creation notice:', authErr.message);
      }
    }

    // 3. Persist rich user profile into Firestore 'users' collection
    try {
      const docId = uid || cleanEmail.replace(/[^a-zA-Z0-9]/g, '_');
      const userDocRef = doc(db, 'users', docId);

      const profilePayload = {
        ...userData,
        uid: uid || docId,
        email: cleanEmail,
        password: cleanPassword, // Kept for CRM RBAC credential synchronization
        status: userData.status || 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(userDocRef, profilePayload, { merge: true });
    } catch (dbErr) {
      console.warn('Firestore user profile save notice:', dbErr.message);
    }

    return { success: true, uid };
  } catch (err) {
    console.error('Error creating Firebase user:', err);
    return { success: false, error: err.message };
  } finally {
    if (secondaryApp) {
      try {
        await deleteApp(secondaryApp);
      } catch {}
    }
  }
}

// Utility to guard cloud network requests from freezing the UI
const withTimeout = (promise, ms = 1200) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Firebase network timeout')), ms))
  ]);
};

/**
 * Authenticate user with Firebase Authentication.
 * Guarded by a strict 1.2-second timeout so the UI is NEVER frozen or stuck loading.
 */
export async function loginWithFirebase(emailOrUsername, password) {
  const input = (emailOrUsername || '').trim();
  const cleanPassword = (password || '').trim();

  if (!input || !cleanPassword) {
    return { success: false, error: 'Please enter both email/username and password' };
  }

  const targetEmail = input.toLowerCase();

  try {
    // Attempt Firebase Authentication with strict timeout
    const cred = await withTimeout(signInWithEmailAndPassword(auth, targetEmail, cleanPassword), 1200);
    const firebaseUser = cred.user;

    // Fast attempt to fetch Firestore document without blocking
    let firestoreData = null;
    try {
      const docRef = doc(db, 'users', firebaseUser.uid);
      const snap = await withTimeout(getDoc(docRef), 1000);
      if (snap && snap.exists && snap.exists()) {
        firestoreData = snap.data();
      }
    } catch {}

    const canonical = CANONICAL_SYSTEM_USERS.find(
      (u) => (u.email && u.email.toLowerCase() === targetEmail)
    );

    const mergedUser = {
      ...(canonical || {}),
      ...(firestoreData || {}),
      uid: firebaseUser.uid,
      email: firebaseUser.email || targetEmail,
      name: firestoreData?.name || canonical?.name || targetEmail.split('@')[0],
      role: firestoreData?.role || canonical?.role || 'Sales Executive',
      roleTier: firestoreData?.roleTier || canonical?.roleTier || 'staff',
      designation: firestoreData?.designation || canonical?.designation || 'Sales Executive',
      department: firestoreData?.department || canonical?.department || 'Commercial Operations',
      image: firestoreData?.image || firestoreData?.avatar || canonical?.image || null,
      avatar: firestoreData?.avatar || firestoreData?.image || canonical?.avatar || null,
      isImage: Boolean(firestoreData?.image || firestoreData?.avatar || canonical?.image)
    };

    return { success: true, user: mergedUser, source: 'firebase' };
  } catch (authError) {
    return { success: false, error: authError.message, code: authError.code };
  }
}

/**
 * Fetch all users from Firestore to synchronize with local storage.
 * Guarded by timeout to avoid blocking page startup.
 */
export async function syncFirestoreUsers() {
  try {
    const snap = await withTimeout(getDocs(collection(db, 'users')), 1500);
    if (snap && !snap.empty) {
      return snap.docs.map((d) => d.data());
    }
  } catch (err) {
    // Silent fallback to local storage
  }
  return [];
}
