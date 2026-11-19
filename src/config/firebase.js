// Al Zaydan CRM - Firebase Configuration Service
// Reads environment variables with safe fallbacks

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD9xn_jPe-4ARdmP3zNXAhU9rhmsWdRBEI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "alzaydan-crm.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "alzaydan-crm",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "alzaydan-crm.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "709527101005",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:709527101005:web:3b0adbdc62627cb8d18604",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-25WJ19LHS1"
};

export default firebaseConfig;
