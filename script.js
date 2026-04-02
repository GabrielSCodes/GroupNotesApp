// Import Firebase configuration and modules
import { auth } from "./firebase-config.js";
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";



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

// Sign in with Google
document.addEventListener("DOMContentLoaded", () => {
    const google = document.getElementById("google");
    if (google) {
        google.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default button behavior
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider)
                .then((result) => {
                    console.log("Google Sign-In successful:", result.user);
                    // You can redirect the user or update the UI here
                })
                .catch((error) => {
                    console.error("Google Sign-In error:", error);
                });
        });
    } else {
        console.error("Google button not found in the DOM.");
    }
});