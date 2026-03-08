/**
 * Firebase Configuration
 * Suplementos Fitness VIP
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyD7cnfYqvxxSvYwb8D95-SsqR1W0oNbbM8",
    authDomain: "suplementosvip-ebaf8.firebaseapp.com",
    projectId: "suplementosvip-ebaf8",
    storageBucket: "suplementosvip-ebaf8.firebasestorage.app",
    messagingSenderId: "684374881083",
    appId: "1:684374881083:web:10329cc2fd7da4c2e57d1e",
    measurementId: "G-8ZZY2MSVYP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
