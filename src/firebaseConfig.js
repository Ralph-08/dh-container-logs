import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC2sUI9HUEKA5eWd5XcdP9Uh9YFxvYAym8",
  authDomain: "contaner-logs.firebaseapp.com",
  projectId: "contaner-logs",
  storageBucket: "contaner-logs.firebasestorage.app",
  messagingSenderId: "818277847510",
  appId: "1:818277847510:web:eb40d690793b651582d477",
  measurementId: "G-T81YP5SCG1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
