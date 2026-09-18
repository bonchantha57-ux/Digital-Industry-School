/**
 * Firebase Service & Configuration
 * Provides Firestore & Authentication services for Digital Industry
 */

import { initializeApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';

// Read config from Vite environment variables (or localStorage override)
const localSavedConfig = localStorage.getItem('digital_industry_firebase_config');
let savedParsed = null;
if (localSavedConfig) {
  try { savedParsed = JSON.parse(localSavedConfig); } catch (e) { /* ignore */ }
}

const firebaseConfig = savedParsed || {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA47drOVG3Ra0Kcr5RzCUiI_tyJQQfbjyI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'studentdinetwork.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'studentdinetwork',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'studentdinetwork.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '159706261341',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:159706261341:web:909f421c3b3a0b32152ab4'
};

export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.apiKey !== 'your_firebase_api_key_here');
}

let app = null;
let db = null;
let auth = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
    auth = getAuth(app);
    console.log('✅ Firebase Firestore & Auth connected successfully to project:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('⚠️ Firebase initialization failed, falling back to local store:', error);
  }
} else {
  console.log('ℹ️ Firebase not yet configured or keys missing. Operating in offline/local mode.');
}

export { 
  app, 
  db, 
  auth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
};

/**
 * Save Firebase configuration directly from UI (Admin settings)
 */
export function saveFirebaseConfig(config) {
  localStorage.setItem('digital_industry_firebase_config', JSON.stringify(config));
  window.location.reload();
}

/**
 * Remove Firebase configuration
 */
export function removeFirebaseConfig() {
  localStorage.removeItem('digital_industry_firebase_config');
  window.location.reload();
}
