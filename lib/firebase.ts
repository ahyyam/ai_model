import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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
    // Missing public envs; defer initialization until runtime where envs exist
    return;
  }
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  _auth = getAuth(app);
  _db = getFirestore(app);
  _storage = getStorage(app);
  try {
    // Best-effort; ignore errors during SSR
    setPersistence(_auth, browserSessionPersistence);
  } catch {}
}

export const auth: Auth = (() => {
  // Avoid throwing during SSR/prerender. Consumers should only use on the client.
  if (!isBrowser) {
    return {} as unknown as Auth;
  }
  ensureClientInitialized();
  return _auth as Auth;
})();

export const db: Firestore = (() => {
  if (!isBrowser) {
    return {} as unknown as Firestore;
  }
  ensureClientInitialized();
  return _db as Firestore;
})();

export const storage: FirebaseStorage = (() => {
  if (!isBrowser) {
    return {} as unknown as FirebaseStorage;
  }
  ensureClientInitialized();
  return _storage as FirebaseStorage;
})();