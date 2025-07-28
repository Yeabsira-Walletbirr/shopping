// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAZXe6ARxhIPJo9QTT-nSwrTSHkRioX1ZY",
    authDomain: "viamart-55986.firebaseapp.com",
    projectId: "viamart-55986",
    storageBucket: "viamart-55986.firebasestorage.app",
    messagingSenderId: "428733619757",
    appId: "1:428733619757:web:06762679bf896e862722a4",
    measurementId: "G-1FR217W5ZW"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

// Safe messaging export
let messaging = null;

isSupported().then((supported) => {
    if (supported) {
        messaging = getMessaging(app);
    } else {
        console.warn("Firebase Messaging is not supported in this browser.");
    }
});

export { messaging };
