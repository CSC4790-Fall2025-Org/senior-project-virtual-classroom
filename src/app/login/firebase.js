// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWE1M6kRz63wVUfhyCQtErKbE7z5hH5uA",
  authDomain: "virtual-classroom-798c7.firebaseapp.com",
  projectId: "virtual-classroom-798c7",
  storageBucket: "virtual-classroom-798c7.firebasestorage.app",
  messagingSenderId: "905440523598",
  appId: "1:905440523598:web:d40f147b5cc51dfb221a1f"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firestore and Auth
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
