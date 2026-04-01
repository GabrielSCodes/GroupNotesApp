import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, getDocs, setDoc, deleteDoc, doc, addDoc, serverTimestamp, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";



document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("toggle");
    const stylesheets = [
        document.getElementById("themeStylesheet"),
        document.getElementById("themeStylesheet2"),
        document.getElementById("themeStylesheet3")
    ];

    // Load saved theme
    let theme = localStorage.getItem("theme") || "light";
    applyTheme(theme);

    // Toggle theme on click
    toggle.addEventListener("click", () => {
        theme = theme === "light" ? "dark" : "light";
        localStorage.setItem("theme", theme);
        applyTheme(theme);
    });

    function applyTheme(mode) {
        stylesheets.forEach(sheet => {
            if (!sheet) return;

            if (mode === "dark") {
                sheet.setAttribute("href", sheet.getAttribute("href").replace(".css", "Dark.css"));
            } else {
                sheet.setAttribute("href", sheet.getAttribute("href").replace("Dark.css", ".css"));
            }
        });

        // Swap icon
        toggle.src = mode === "dark"
            ? "assets/sun/lightB.png"   // show sun in dark mode
            : "assets/moon/darkB.png";  // show moon in light mode
    }
});