import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';
import { firebaseConfig } from './firebaseConfig'; // Import the config

// Initialize Firebase
const app = initializeApp(firebaseConfig);


const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, analytics, storage };