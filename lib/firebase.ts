import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { doc } from "firebase/firestore";

const isBrowser = typeof window !== "undefined";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function ensureClientInitialized() {
  if (!isBrowser) return;
  if (app) return;
  
  // Only initialize if we have a minimally valid config
  if (!firebaseConfig.apiKey || !firebaseConfig.appId) {
    console.error("Missing Firebase configuration:", {
      hasApiKey: !!firebaseConfig.apiKey,
      hasAppId: !!firebaseConfig.appId,
      hasProjectId: !!firebaseConfig.projectId,
      hasAuthDomain: !!firebaseConfig.authDomain
    })
    // Missing public envs; defer initialization until runtime where envs exist
    return;
  }
  
  try {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
    _auth = getAuth(app);
    _db = getFirestore(app);
    _storage = getStorage(app);
    
    console.log("Firebase client initialized successfully")
    
    try {
      // Best-effort; ignore errors during SSR
      setPersistence(_auth, browserSessionPersistence);
      console.log("Firebase auth persistence set successfully")
    } catch (persistenceError) {
      console.warn("Failed to set Firebase auth persistence:", persistenceError)
    }
  } catch (error) {
    console.error("Firebase client initialization failed:", error)
    throw error
  }
}

export const auth: Auth = (() => {
  // Avoid throwing during SSR/prerender. Consumers should only use on the client.
  if (!isBrowser) {
    return {} as unknown as Auth; // SSR-safe placeholder
  }
  ensureClientInitialized();
  return (_auth ?? ({} as unknown as Auth)) as Auth;
})();

export const db: Firestore = (() => {
  if (!isBrowser) {
    return {} as unknown as Firestore; // SSR-safe placeholder
  }
  ensureClientInitialized();
  return (_db ?? ({} as unknown as Firestore)) as Firestore;
})();

export const storage: FirebaseStorage = (() => {
  if (!isBrowser) {
    return {} as unknown as FirebaseStorage; // SSR-safe placeholder
  }
  ensureClientInitialized();
  return (_storage ?? ({} as unknown as FirebaseStorage)) as FirebaseStorage;
})();

// Test function to verify Firebase client is working
export async function testFirebaseConnection(): Promise<boolean> {
  if (!isBrowser) return false;
  
  try {
    ensureClientInitialized();
    
    if (!_auth || !_db) {
      console.error("Firebase not properly initialized")
      return false
    }
    
    // Test if we can access Firestore
    const testDoc = doc(_db, 'test', 'connection-test')
    console.log("Firebase client connection test successful")
    return true
  } catch (error) {
    console.error("Firebase client connection test failed:", error)
    return false
  }
}