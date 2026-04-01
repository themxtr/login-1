import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDF6l3SG9E8HLiYhraOWYUtQ7aMqlWEelk",
  authDomain: "dashboardfincheck.firebaseapp.com",
  projectId: "dashboardfincheck",
  storageBucket: "dashboardfincheck.firebasestorage.app",
  messagingSenderId: "867198692746",
  appId: "1:867198692746:web:d31f145bb28ff606146c73",
  measurementId: "G-30GQEZGVEV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
