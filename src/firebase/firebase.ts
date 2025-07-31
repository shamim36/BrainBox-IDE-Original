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
  apiKey: "AIzaSyDAX7hIdkjNcEE6LNK0rCiAtkPeFYA7ZgE",
  authDomain: "brainbox-ide-type.firebaseapp.com",
  projectId: "brainbox-ide-type",
  storageBucket: "brainbox-ide-type.firebasestorage.app",
  messagingSenderId: "946074743090",
  appId: "1:946074743090:web:b87d9b6ef42bb5f412672b",
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
