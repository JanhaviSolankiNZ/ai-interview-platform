import { initializeApp, getApp, getApps } from "firebase/app";
import {getAuth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBIrCn03f5z6tvn05AB9AIjPyRsoLKvZk0",
    authDomain: "prep-ai-eb405.firebaseapp.com",
    projectId: "prep-ai-eb405",
    storageBucket: "prep-ai-eb405.firebasestorage.app",
    messagingSenderId: "545470445654",
    appId: "1:545470445654:web:4714eb3f084ccf86fe23f7",
    measurementId: "G-12YYYT4Q0F"
};

const app = !getApps().length ? initializeApp(firebaseConfig): getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

