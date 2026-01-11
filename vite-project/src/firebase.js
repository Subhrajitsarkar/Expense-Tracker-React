// This file is for your Firebase configuration.
// Since we are using the REST API, we don't need the full Firebase SDK initialization for auth.
// However, you should fill this out with your project's details from the Firebase console
// for other Firebase services you might use later (like Firestore or Storage).

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "YOUR_AUTH_DOMAIN", // e.g., your-project-id.firebaseapp.com
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET", // e.g., your-project-id.appspot.com
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
