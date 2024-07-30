// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Remove the getAnalytics import unless you specifically need it
// import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBUcPg0f8KHw2mwKYbn2lLo4toRp5IGiv8",
  authDomain: "pantrykevitruon.firebaseapp.com",
  projectId: "pantrykevitruon",
  storageBucket: "pantrykevitruon.appspot.com",
  messagingSenderId: "82697297748",
  appId: "1:82697297748:web:b5e311862365ff1e9ff2c1",
  measurementId: "G-DC0FHWE730"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Remove the analytics initialization unless you specifically need it
// const analytics = getAnalytics(app);

export { db };
