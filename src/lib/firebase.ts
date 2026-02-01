// Firebase configuration and initialization...!

import { initializeApp } from "firebase/app";

import { getAuth } from "firebase/auth"; // for authentication
import { getFirestore } from "firebase/firestore"; // for firestore database

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBE9OJhdBGCDFs75qRA7r6PvdBmuedozR8",
//   authDomain: "learning-firebase-with-next-js.firebaseapp.com",
//   projectId: "learning-firebase-with-next-js",
//   storageBucket: "learning-firebase-with-next-js.firebasestorage.app",
//   messagingSenderId: "532450778952",
//   appId: "1:532450778952:web:257c7cfe8b90d76bfc9d7d",
//   measurementId: "G-L9JJTLE24V",
// };

const firebaseConfig = {
  apiKey: "AIzaSyAa4dHajuTeuP-NWKrSZxCGju3-_AYwtX0",
  authDomain: "internet-billing-system-89bfa.firebaseapp.com",
  projectId: "internet-billing-system-89bfa",
  storageBucket: "internet-billing-system-89bfa.firebasestorage.app",
  messagingSenderId: "852290973672",
  appId: "1:852290973672:web:7c567352a5ebef4f48be5d",
  measurementId: "G-4Q3BXSJK27"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Authentication
const auth = getAuth(app);

// Database
const db = getFirestore(app);

export { app, auth, db };


// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// // For Firebase JS SDK v7.20.0 and later, measurementId is optional
// const firebaseConfig = {
//   apiKey: "AIzaSyAa4dHajuTeuP-NWKrSZxCGju3-_AYwtX0",
//   authDomain: "internet-billing-system-89bfa.firebaseapp.com",
//   projectId: "internet-billing-system-89bfa",
//   storageBucket: "internet-billing-system-89bfa.firebasestorage.app",
//   messagingSenderId: "852290973672",
//   appId: "1:852290973672:web:7c567352a5ebef4f48be5d",
//   measurementId: "G-4Q3BXSJK27"
// };

