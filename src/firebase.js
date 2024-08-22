import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBIbPTHpC1a31Mp138WplOChqYs_Mbp0HQ",
  authDomain: "hritik-495a9.firebaseapp.com",
  databaseURL: "https://hritik-495a9-default-rtdb.firebaseio.com",
  projectId: "hritik-495a9",
  storageBucket: "hritik-495a9.appspot.com",
  messagingSenderId: "586339645974",
  appId: "1:586339645974:web:06cce80d725011977a1337",
  measurementId: "G-JSLS154M3S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, googleProvider, db };