import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "gincana2026-cacc5.firebaseapp.com",
  projectId: "gincana2026-cacc5",
  storageBucket: "gincana2026-cacc5.firebasestorage.app",
  messagingSenderId: "817814182453",
  appId: "1:817814182453:web:7037ae851257a5bd6caf7c"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);