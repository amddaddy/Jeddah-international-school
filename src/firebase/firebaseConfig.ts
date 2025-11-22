
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

// Helper to safely access environment variables in various environments (Vite, Node, etc.)
const getEnv = (key: string): string => {
    let value = undefined;

    // 1. Try Vite (import.meta.env)
    try {
        // @ts-ignore
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            // @ts-ignore
            value = import.meta.env[key];
        }
    } catch (e) {
        // Ignore errors accessing import.meta
    }

    // 2. Try Node/Process (process.env) if not found yet
    if (value === undefined) {
        try {
            if (typeof process !== 'undefined' && process.env) {
                value = process.env[key];
            }
        } catch (e) {
            // Ignore errors accessing process
        }
    }

    return value || "";
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

// Check if config is valid to provide helpful console warning
if (!firebaseConfig.apiKey) {
    console.error("Firebase API Key is missing. Please ensure you have a .env file with VITE_FIREBASE_API_KEY set.");
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);
export const storage = getStorage(app);
