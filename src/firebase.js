// Import the functions you need from the Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // For using Firestore database
import { getAuth } from "firebase/auth"; // For authentication (if needed)
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage'; // Import Firebase Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA7O-b_5KDKXCV86eG6KD7gF-Q1P2dQYBA",
  authDomain: "hot-takes-965ca.firebaseapp.com",
  databaseURL: "https://hot-takes-965ca-default-rtdb.firebaseio.com",
  projectId: "hot-takes-965ca",
  storageBucket: "hot-takes-965ca.appspot.com",
  messagingSenderId: "172295122616",
  appId: "1:172295122616:web:9fbd169c0fd0ff9be88e4d",
  measurementId: "G-5XR61BZ2QX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = getAnalytics(app); // For analytics
const db = getFirestore(app); // Initialize Firestore for database
const auth = getAuth(app); // Initialize Firebase Authentication (if needed)
const storage = getStorage(app); // Initialize Firebase Storage

export { db, auth, analytics, storage };
