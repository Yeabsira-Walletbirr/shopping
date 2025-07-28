// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAZXe6ARxhIPJo9QTT-nSwrTSHkRioX1ZY",
  authDomain: "viamart-55986.firebaseapp.com",
  projectId: "viamart-55986",
  storageBucket: "viamart-55986.firebasestorage.app",
  messagingSenderId: "428733619757",
  appId: "1:428733619757:web:06762679bf896e862722a4",
  measurementId: "G-1FR217W5ZW"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: '/icon.png',
  });
});
