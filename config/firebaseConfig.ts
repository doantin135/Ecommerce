import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDf9R8XK-qm2Yp0wQCjFZ_dLs6piCCtqkc",
  authDomain: "e-commerce-cf3f6.firebaseapp.com",
  projectId: "e-commerce-cf3f6",
  storageBucket: "e-commerce-cf3f6.firebasestorage.app",
  messagingSenderId: "1035246914242",
  appId: "1:1035246914242:web:6c8e47c4a7a1936bc9c95b",
  measurementId: "G-CDLHSWHB38"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);