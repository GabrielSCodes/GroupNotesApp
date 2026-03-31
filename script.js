import { auth, db } from "./firebase-config.js";
import { 
  GoogleAuthProvider, 
  signInWithPopup 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Google Sign-In
const loginButton = document.getElementById("login");
if (!loginButton) {
  console.error("Login button not found. Ensure the button with ID 'login' exists in your HTML.");
}

const provider = new GoogleAuthProvider();

loginButton.addEventListener("click", async () => {
  console.log("Login button clicked.");
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("User signed in:", user);
  } catch (error) {
    console.error("Error during Google Sign-In:", error);
  }
});