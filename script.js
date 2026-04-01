import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { collection, getDocs, setDoc, deleteDoc, doc, addDoc, serverTimestamp, updateDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

//Dark theme
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    const link = document.getElementById("themeStylesheet");


    if (savedTheme === "dark") {
        link.setAttribute("href", "styles/boardsDark.css");
    } else if (savedTheme === "light") {
        link.setAttribute("href", "styles/boards.css");
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('toggle');


    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const link = document.getElementById('themeStylesheet');


            if (link && link.getAttribute('href').includes('styles/boards.css')) {
                link.setAttribute('href', 'styles/boardsDark.css');
                localStorage.setItem("theme", "dark");
            } else if (link && link.getAttribute('href').includes('styles/boardsDark.css')) {
                link.setAttribute('href', 'styles/boards.css');
                localStorage.setItem("theme", "light");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    const link = document.getElementById("themeStylesheet2");


    if (savedTheme === "dark") {
        link.setAttribute("href", "styles/homeDark.css");
    } else if (savedTheme === "light") {
        link.setAttribute("href", "styles/home.css");
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('toggle');


    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const link = document.getElementById('themeStylesheet2');


            if (link && link.getAttribute('href').includes('styles/home.css')) {
                link.setAttribute('href', 'styles/homeDark.css');
                localStorage.setItem("theme", "dark");
            } else if (link && link.getAttribute('href').includes('styles/homeDark.css')) {
                link.setAttribute('href', 'styles/home.css');
                localStorage.setItem("theme", "light");
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme");
    const link = document.getElementById("themeStylesheet3");


    if (savedTheme === "dark") {
        link.setAttribute("href", "styles/notesDark.css");
    } else if (savedTheme === "light") {
        link.setAttribute("href", "styles/notes.css");
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('toggle');


    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            const link = document.getElementById('themeStylesheet3');


            if (link && link.getAttribute('href').includes('styles/notes.css')) {
                link.setAttribute('href', 'styles/notesDark.css');
                localStorage.setItem("theme", "dark");
            } else if (link && link.getAttribute('href').includes('styles/notesDark.css')) {
                link.setAttribute('href', 'styles/notes.css');
                localStorage.setItem("theme", "light");
            }
        });
    }
});