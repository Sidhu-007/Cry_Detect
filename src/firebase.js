import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword as fbSignInWithEmailAndPassword,
  signInWithPopup as fbSignInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged as fbOnAuthStateChanged,
  signOut as fbSignOut
} from "firebase/auth";
import {
  getFirestore,
  doc as fbDoc,
  getDoc as fbGetDoc,
  setDoc as fbSetDoc,
  collection as fbCollection,
  getDocs as fbGetDocs,
  updateDoc as fbUpdateDoc,
  deleteDoc as fbDeleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "demo",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo"
};

const isDemo = firebaseConfig.apiKey === "demo";

let app, auth, db;

if (!isDemo) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

// --- DEMO MOCK IMPLEMENTATION ---
// To ensure the demo works reliably as requested without needing to configure Firebase keys.
const mockDb = {
  users: {
    "admin_uid": { email: "admin", role: "administrator", displayName: "Admin User" },
    "op_uid": { email: "operator@example.com", role: "operator", displayName: "Operator User" },
    "resp_uid": { email: "responder@example.com", role: "responder", displayName: "Responder User" }
  },
  cameras: {
    "1": { name: "Main Lobby", location: "Entrance", status: "online", url: "https://www.youtube.com/watch?v=aqz-KE-bpKQ" },
    "2": { name: "Restaurant", location: "Dining", status: "alert", url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" },
    "3": { name: "Pool Area", location: "Recreation", status: "online", url: "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
    "4": { name: "Parking Lot A", location: "Parking", status: "online", url: "" },
    "5": { name: "Hallway North", location: "Level 1", status: "online", url: "" },
    "6": { name: "Service Elevator", location: "Back of House", status: "online", url: "" },
    "7": { name: "Kitchen", location: "Back of House", status: "online", url: "https://www.youtube.com/live/PFiG-hh07bM?si" }
  }
};

let currentUser = null;
let authListeners = [];

const notifyListeners = () => {
  authListeners.forEach(listener => listener(currentUser));
};

export const signInWithEmailAndPassword = async (authInstance, email, password) => {
  if (!isDemo) return fbSignInWithEmailAndPassword(authInstance, email, password);

  if (email === "admin" && password === "root@123") {
    currentUser = { uid: "admin_uid", email: "admin" };
    notifyListeners();
    return { user: currentUser };
  } else if (email === "operator@example.com" && password === "op123") {
    currentUser = { uid: "op_uid", email: "operator@example.com" };
    notifyListeners();
    return { user: currentUser };
  } else if (email === "responder@example.com" && password === "resp123") {
    currentUser = { uid: "resp_uid", email: "responder@example.com" };
    notifyListeners();
    return { user: currentUser };
  }
  throw new Error("Invalid credentials");
};

export const signInWithPopup = async (authInstance, provider) => {
  if (!isDemo) return fbSignInWithPopup(authInstance, provider);

  // Mock Google Login
  currentUser = { uid: "op_uid", email: "operator@example.com", displayName: "Google Operator" };
  notifyListeners();
  return { user: currentUser };
};

export const signOut = async (authInstance) => {
  if (!isDemo) return fbSignOut(authInstance);
  currentUser = null;
  notifyListeners();
};

export const onAuthStateChanged = (authInstance, callback) => {
  if (!isDemo) return fbOnAuthStateChanged(authInstance, callback);

  authListeners.push(callback);
  callback(currentUser);
  return () => {
    authListeners = authListeners.filter(l => l !== callback);
  };
};

export const getDoc = async (docRef) => {
  if (!isDemo) return fbGetDoc(docRef);

  const id = docRef.id;
  const collectionName = docRef.collection;
  if (mockDb[collectionName] && mockDb[collectionName][id]) {
    return { exists: () => true, data: () => mockDb[collectionName][id] };
  }
  return { exists: () => false, data: () => null };
};

export const setDoc = async (docRef, data) => {
  if (!isDemo) return fbSetDoc(docRef, data);
  const collectionName = docRef.collection;
  if (!mockDb[collectionName]) mockDb[collectionName] = {};
  mockDb[collectionName][docRef.id] = data;
};

export const updateDoc = async (docRef, data) => {
  if (!isDemo) return fbUpdateDoc(docRef, data);
  const collectionName = docRef.collection;
  if (mockDb[collectionName] && mockDb[collectionName][docRef.id]) {
    mockDb[collectionName][docRef.id] = { ...mockDb[collectionName][docRef.id], ...data };
  }
};

export const getDocs = async (collectionRef) => {
  if (!isDemo) return fbGetDocs(collectionRef);

  const collectionName = collectionRef.collection;
  const docsArray = [];

  if (mockDb[collectionName]) {
    Object.keys(mockDb[collectionName]).map(id => {
      docsArray.push({
        id,
        data: () => mockDb[collectionName][id]
      });
    });
  }

  return {
    docs: docsArray,
    forEach: (callback) => docsArray.forEach(callback)
  };
};

export const deleteDoc = async (docRef) => {
  if (!isDemo) return fbDeleteDoc(docRef);
  const collectionName = docRef.collection;
  if (mockDb[collectionName]) {
    delete mockDb[collectionName][docRef.id];
  }
};

export const doc = (dbInstance, collectionName, id) => {
  if (!isDemo) return fbDoc(dbInstance, collectionName, id);
  return { id: id || `mock_${Math.random().toString(36).substr(2, 9)}`, collection: collectionName };
};

export const collection = (dbInstance, collectionName) => {
  if (!isDemo) return fbCollection(dbInstance, collectionName);
  return { collection: collectionName };
};

export { auth, db, GoogleAuthProvider, onSnapshot, query, orderBy, limit };
