import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Ваші реальні дані з консолі Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBj0ID56YOMTEhvcTD1tdieDqSqjwqfw1w",
  authDomain: "kcyc-site-b9544.firebaseapp.com",
  projectId: "kcyc-site-b9544",
  storageBucket: "kcyc-site-b9544.firebasestorage.app",
  messagingSenderId: "146472099125",
  appId: "1:146472099125:web:d29ca8e5975595b642407c",
  measurementId: "G-TSR4D10YFY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);