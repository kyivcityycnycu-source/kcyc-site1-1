import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/** Env first; hardcoded fallbacks keep Cloudflare build working if vars not set yet. */
const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyBj0ID56YOMTEhvcTD1tdieDqSqjwqfw1w",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "kcyc-site-b9544.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "kcyc-site-b9544",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "kcyc-site-b9544.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "146472099125",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:146472099125:web:d29ca8e5975595b642407c",
  measurementId:
    import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ||
    import.meta.env.VITE_GA_MEASUREMENT_ID ||
    "G-0Q3R03CYK3",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
