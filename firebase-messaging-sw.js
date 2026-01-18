// Firebase Messaging Service Worker
// This file is required for FCM to work in the browser
// Note: Service workers can't import external JS files the same way, 
// so we use a dynamic approach here

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// The config will be injected when the service worker is registered
// For now, use minimal config (messagingSenderId is the only required field for receiving)
// This gets the config from the main page via postMessage or you can set it here

// Listen for config from main page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    firebase.initializeApp(event.data.config);
    console.log('Firebase SW initialized via message');
  }
});

// Fallback: Initialize with default config if available
// Copy firebase-config.example.js to firebase-config.js and update these values
// Or the main page will send the config via postMessage
try {
  if (!firebase.apps.length) {
    // This will be replaced by actual config when you set up the project
    console.log('Waiting for Firebase config from main page...');
  }
} catch (e) {
  console.log('Firebase not yet initialized in SW');
}

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
