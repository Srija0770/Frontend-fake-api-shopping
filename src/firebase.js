// Import the necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDCi8S8WaCs9TkTnOJpY3HFIUqGjKp-Ozo",
  authDomain: "shopping-30221.firebaseapp.com",
  projectId: "shopping-30221",
  storageBucket: "shopping-30221.firebasestorage.app",
  messagingSenderId: "624525048582",
  appId: "1:624525048582:web:00be26c49a3258ca13bc87",
  measurementId: "G-LGN16HN8RG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();