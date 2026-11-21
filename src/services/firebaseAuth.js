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

/**
 * Authenticate user with Firebase Authentication.
 * If user entered a username instead of an email, automatically resolves the email first.
 * Falls back seamlessly to local database if Firebase is unreachable or user is local.
 */
export async function loginWithFirebase(emailOrUsername, password) {
  const input = (emailOrUsername || '').trim();
  const cleanPassword = (password || '').trim();

  if (!input || !cleanPassword) {
    return { success: false, error: 'Please enter both email/username and password' };
  }

  // Determine if input is email or username
  let targetEmail = input.toLowerCase();
  if (!targetEmail.includes('@')) {
    // Look up email by username from Firestore or local directory
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', input.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        targetEmail = snap.docs[0].data().email || targetEmail;
      }
    } catch {
      // Fallback to local
    }
  }

  // 1. Try Firebase Authentication
  try {
    const cred = await signInWithEmailAndPassword(auth, targetEmail, cleanPassword);
    const firebaseUser = cred.user;

    // Fetch full user record from Firestore
    let firestoreData = null;
    try {
      const docRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        firestoreData = snap.data();
      }
    } catch (e) {
      console.warn('Failed to fetch Firestore doc on login:', e);
    }

    // Merge with canonical/local if available
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
    // If Firebase Auth fails (e.g. invalid credential, user-not-found, or network error),
    // check Firestore 'users' collection or local database as secondary fallback
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', targetEmail));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const docUser = snap.docs[0].data();
        if (docUser && docUser.password === cleanPassword) {
          return { success: true, user: docUser, source: 'firestore' };
        }
      }
    } catch {}

    // Return detailed error code for debugging
    return { success: false, error: authError.message, code: authError.code };
  }
}

/**
 * Fetch all users from Firestore to synchronize with local storage.
 */
export async function syncFirestoreUsers() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      const firestoreUsers = snap.docs.map((d) => d.data());
      return firestoreUsers;
    }
  } catch (err) {
    console.warn('Could not sync users from Firestore:', err.message);
  }
  return [];
}
