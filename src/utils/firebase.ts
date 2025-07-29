import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, isSupported, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAZXe6ARxhIPJo9QTT-nSwrTSHkRioX1ZY",
  authDomain: "viamart-55986.firebaseapp.com",
  projectId: "viamart-55986",
  storageBucket: "viamart-55986.firebasestorage.app",
  messagingSenderId: "428733619757",
  appId: "1:428733619757:web:06762679bf896e862722a4",
  measurementId: "G-1FR217W5ZW"
};
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messaging: ReturnType<typeof getMessaging> | null = null;

const initializeMessaging = async () => {
  const supported = await isSupported();
  if (supported) {
    messaging = getMessaging(app);
  }
};

export { app, messaging, initializeMessaging };