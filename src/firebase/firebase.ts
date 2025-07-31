import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Import Analytics types and the getAnalytics function
import { getAnalytics, Analytics } from "firebase/analytics";

import {
  collection,
  query,
  getDocs,
  where,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
//   measurementId: "G-G3R0DLXH34"
};
// Initialize Firebase App.
// This pattern prevents re-initializing the app on every hot-reload.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services that are safe to run on the server, like Auth and Firestore.
const auth = getAuth(app);
const firestore = getFirestore(app);

// Declare a variable for Analytics that can be null.
let analytics: Analytics | null = null;

// **THE FIX**: Conditionally initialize Analytics only on the client-side.
// We check if 'window' is defined, which is only true in a browser environment.
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Export the instances to be used in other parts of your application.
export { auth, firestore, app, analytics };
