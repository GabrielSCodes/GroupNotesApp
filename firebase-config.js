import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBp131q_xCk0gvZ9IXJmTB2H8y9Ir5unD8",
    authDomain: "groupnotesapp-f2857.firebaseapp.com",
    projectId: "groupnotesapp-f2857",
    storageBucket: "groupnotesapp-f2857.firebasestorage.app",
    messagingSenderId: "104016677388",
    appId: "1:104016677388:web:71df6cdb6425f76a2fbc29"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };