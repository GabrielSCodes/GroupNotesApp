// Import Firebase configuration and modules
import { auth, db } from "./firebase-config.js";
import {
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    addDoc,
    collection,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    serverTimestamp,
    arrayUnion,
    onSnapshot,
    getDoc,
    setDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const provider = new GoogleAuthProvider();

function applyTheme(mode) {
    const stylesheets = [
        document.getElementById("themeStylesheet"),
        document.getElementById("themeStylesheet2"),
        document.getElementById("themeStylesheet3")
    ];

    const normalizedMode = mode === "dark" ? "dark" : "light";
    localStorage.setItem("theme", normalizedMode);

    stylesheets.forEach(sheet => {
        if (!sheet) return;

        const href = sheet.getAttribute("href");
        if (normalizedMode === "dark") {
            sheet.setAttribute("href", href.replace(/\.css$/, "Dark.css"));
        } else {
            sheet.setAttribute("href", href.replace(/Dark\.css$/, ".css"));
        }
    });
}

function setupThemeToggle() {
    const toggle = document.getElementById("toggle");
    if (!toggle) return;

    let theme = localStorage.getItem("theme") || "light";
    applyTheme(theme);

    toggle.addEventListener("click", () => {
        theme = theme === "light" ? "dark" : "light";
        applyTheme(theme);
        toggle.src = theme === "dark"
            ? "assets/sun/lightB.png"
            : "assets/moon/darkB.png";
    });

    toggle.src = theme === "dark"
        ? "assets/sun/lightB.png"
        : "assets/moon/darkB.png";
}

function setupGoogleSignIn() {
    const signInButton = document.querySelector("button.google");
    if (!signInButton) return;

    signInButton.addEventListener("click", async () => {
        try {
            await signInWithPopup(auth, provider);
            window.location.href = "boards.html";
        } catch (error) {
            console.error("Google sign-in failed:", error);
            alert("Google sign-in failed. Please try again.");
        }
    });
}

function setupNavbar(user) {
    const userAvatar = document.getElementById("userAvatar");
    const userNameField = document.querySelector(".mid p:nth-of-type(1)");
    const userEmailField = document.querySelector(".mid p:nth-of-type(2)");
    const logoutButton = document.getElementById("logoutButton");

    if (userAvatar) {
        userAvatar.src = user.photoURL || "assets/logo/logoB.png";
        userAvatar.alt = user.displayName ? `${user.displayName}'s avatar` : "User avatar";
    }
    if (userNameField) {
        userNameField.textContent = user.displayName || "Signed in user";
    }
    if (userEmailField) {
        userEmailField.textContent = user.email || "No email available";
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "home.html";
            } catch (error) {
                console.error("Sign-out failed:", error);
                alert("Logout failed. Please try again.");
            }
        });
    }
}

function guardBoardsRoute(user) {
    const path = window.location.pathname;
    if (path.endsWith("boards.html") && !user) {
        window.location.href = "home.html";
    }
    if ((path.endsWith("home.html") || path.endsWith("/") || path.endsWith("index.html")) && user) {
        window.location.href = "boards.html";
    }
}

function timeAgo(timestamp) {
    const now = new Date();
    const created = timestamp.toDate();
    const diffMs = now - created;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHour < 24) return `${diffHour} hours ago`;
    return `${diffDay} days ago`;
}

async function createBoard(name, user) {
    try {
        const docRef = await addDoc(collection(db, "boards"), {
            name: name,
            creatorId: user.uid,
            createdAt: serverTimestamp(),
            users: [user.uid]
        });
        console.log("Board created with ID: ", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("Error creating board: ", error);
        alert("Failed to create board. Please try again.");
    }
}

async function joinBoard(boardId, user) {
    try {
        const boardRef = doc(db, "boards", boardId);
        await updateDoc(boardRef, {
            users: arrayUnion(user.uid)
        });
        console.log("Joined board: ", boardId);
    } catch (error) {
        console.error("Error joining board: ", error);
        alert("Failed to join board. Check the ID and try again.");
    }
}

async function loadBoards(user) {
    try {
        const q = query(collection(db, "boards"), where("users", "array-contains", user.uid));
        const querySnapshot = await getDocs(q);
        const boards = [];
        querySnapshot.forEach((doc) => {
            boards.push({ id: doc.id, ...doc.data() });
        });
        displayBoards(boards);
    } catch (error) {
        console.error("Error loading boards: ", error);
    }
}

function displayBoards(boards) {
    const boardsContainer = document.querySelector(".boards");
    const boardList = boardsContainer.querySelector(".boardList");
    boardList.innerHTML = "";

    if (boards.length === 0) {
        boardsContainer.querySelector("h1").textContent = "There are No Boards to show";
        return;
    }

    boardsContainer.querySelector("h1").textContent = "Your Boards";

    boards.forEach(board => {
        const card = document.createElement("div");
        card.className = "board-card";
        const isCreator = auth.currentUser && auth.currentUser.uid === board.creatorId;
        card.innerHTML = `
            <h2>${board.name}</h2>
            <p>Created ${timeAgo(board.createdAt)}</p>
            ${isCreator ? '<button class="delete-button" data-board-id="' + board.id + '">Delete Board</button>' : ''}
        `;
        card.addEventListener("click", (e) => {
            if (e.target.classList.contains("delete-button")) return; // Don't navigate if delete clicked
            window.location.href = `notes.html?boardId=${board.id}`;
        });
        if (isCreator) {
            card.querySelector(".delete-button").addEventListener("click", async () => {
                await deleteBoard(board.id);
            });
        }
        boardList.appendChild(card);
    });
}

function getBoardIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('boardId');
}

async function loadBoardInfo(boardId) {
    try {
        const boardDoc = await getDoc(doc(db, "boards", boardId));
        if (boardDoc.exists()) {
            const board = boardDoc.data();
            document.getElementById("boardTitle").textContent = board.name;
            document.getElementById("boardId").textContent = `Board ID: ${boardId}`;
            document.getElementById("boardCreated").textContent = `Created ${timeAgo(board.createdAt)}`;
        }
    } catch (error) {
        console.error("Error loading board info:", error);
    }
}

async function addNote(boardId, content, user) {
    try {
        await addDoc(collection(db, "notes"), {
            boardId: boardId,
            content: content,
            userId: user.uid,
            userName: user.displayName || "Anonymous",
            userPhoto: user.photoURL || "assets/logo/logoB.png",
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding note:", error);
    }
}

function displayNotes(boardId) {
    const notesList = document.getElementById("notesList");
    const q = query(collection(db, "notes"), where("boardId", "==", boardId));
    onSnapshot(q, (querySnapshot) => {
        notesList.innerHTML = "";
        querySnapshot.forEach((docSnap) => {
            const note = { id: docSnap.id, ...docSnap.data() };
            const noteCard = document.createElement("div");
            noteCard.className = "note-card";
            const isOwner = auth.currentUser && auth.currentUser.uid === note.userId;
            noteCard.innerHTML = `
                <div class="note-header">
                    <img src="${note.userPhoto}" alt="${note.userName}'s avatar" class="note-avatar">
                    <span class="note-user">${note.userName}</span>
                    ${isOwner ? '<button class="delete-button" data-note-id="' + note.id + '">Delete Note</button>' : ''}
                </div>
                <p>${note.content}</p>
                <p>Posted ${timeAgo(note.createdAt)}</p>
                <div class="reactions">
                    <div class="reaction" data-emoji="👍">👍 <span id="count-${note.id}-👍">0</span></div>
                    <div class="reaction" data-emoji="👎">👎 <span id="count-${note.id}-👎">0</span></div>
                    <div class="reaction" data-emoji="🔥">🔥 <span id="count-${note.id}-🔥">0</span></div>
                    <div class="reaction" data-emoji="❤️">❤️ <span id="count-${note.id}-❤️">0</span></div>
                </div>
                <button class="add-comment-button board-button" data-note-id="${note.id}">Add Comment</button>
                <div class="comment-section" id="comments-${note.id}"></div>
            `;
            if (isOwner) {
                noteCard.querySelector(".delete-button").addEventListener("click", () => {
                    deleteNote(note.id);
                });
            }
            notesList.appendChild(noteCard);

            // Add reaction listeners
            noteCard.querySelectorAll(".reaction").forEach(reaction => {
                reaction.addEventListener("click", () => {
                    const emoji = reaction.dataset.emoji;
                    handleReaction(note.id, emoji, auth.currentUser);
                });
            });

            // Add comment button listener
            noteCard.querySelector(".add-comment-button").addEventListener("click", () => {
                const commentInput = document.createElement("textarea");
                commentInput.placeholder = "Add a comment...";
                const postButton = document.createElement("button");
                postButton.textContent = "Post Comment";
                postButton.className = "board-button";
                postButton.addEventListener("click", async () => {
                    const content = commentInput.value.trim();
                    if (content) {
                        await addComment(note.id, content, auth.currentUser);
                        commentInput.remove();
                        postButton.remove();
                    }
                });
                noteCard.appendChild(commentInput);
                noteCard.appendChild(postButton);
            });

            // Load reactions and comments
            loadReactions(note.id);
            displayComments(note.id);
        });
    });
}

async function handleReaction(noteId, emoji, user) {
    const reactionRef = doc(db, "notes", noteId, "reactions", user.uid);
    try {
        const reactionDoc = await getDoc(reactionRef);
        if (reactionDoc.exists()) {
            const currentEmoji = reactionDoc.data().emoji;
            if (currentEmoji === emoji) {
                // Remove reaction
                await deleteDoc(reactionRef);
            } else {
                // Update to new emoji
                await setDoc(reactionRef, { emoji: emoji });
            }
        } else {
            // Add new reaction
            await setDoc(reactionRef, { emoji: emoji });
        }
    } catch (error) {
        console.error("Error handling reaction:", error);
    }
}

function loadReactions(noteId) {
    const reactionsRef = collection(db, "notes", noteId, "reactions");
    onSnapshot(reactionsRef, (querySnapshot) => {
        const counts = { "👍": 0, "👎": 0, "🔥": 0, "❤️": 0 };
        querySnapshot.forEach((doc) => {
            const emoji = doc.data().emoji;
            counts[emoji]++;
        });
        Object.keys(counts).forEach(emoji => {
            const countElement = document.getElementById(`count-${noteId}-${emoji}`);
            if (countElement) {
                countElement.textContent = counts[emoji];
            }
        });
    });
}

async function addComment(noteId, content, user) {
    try {
        await addDoc(collection(db, "notes", noteId, "comments"), {
            content: content,
            userId: user.uid,
            userName: user.displayName || "Anonymous",
            userPhoto: user.photoURL || "assets/logo/logoB.png",
            createdAt: serverTimestamp()
        });
    } catch (error) {
        console.error("Error adding comment:", error);
    }
}

function displayComments(noteId) {
    const commentsRef = collection(db, "notes", noteId, "comments");
    onSnapshot(commentsRef, (querySnapshot) => {
        const commentSection = document.getElementById(`comments-${noteId}`);
        commentSection.innerHTML = "";
        querySnapshot.forEach((docSnap) => {
            const comment = { id: docSnap.id, ...docSnap.data() };
            const commentDiv = document.createElement("div");
            commentDiv.className = "comment";
            const isOwner = auth.currentUser && auth.currentUser.uid === comment.userId;
            commentDiv.innerHTML = `
                <div class="comment-header">
                    <img src="${comment.userPhoto}" alt="${comment.userName}'s avatar" class="comment-avatar">
                    <span class="comment-user">${comment.userName}</span>
                    ${isOwner ? '<button class="delete-button" data-comment-id="' + comment.id + '" data-note-id="' + noteId + '">Delete</button>' : ''}
                </div>
                <p>${comment.content}</p>
                <p>Commented ${timeAgo(comment.createdAt)}</p>
            `;
            if (isOwner) {
                commentDiv.querySelector(".delete-button").addEventListener("click", () => {
                    deleteComment(noteId, comment.id);
                });
            }
            commentSection.appendChild(commentDiv);
        });
    });
}

async function deleteBoard(boardId) {
    try {
        await deleteDoc(doc(db, "boards", boardId));
        console.log("Board deleted: ", boardId);
        if (auth.currentUser) {
            await loadBoards(auth.currentUser);
        } else {
            window.location.reload();
        }
    } catch (error) {
        console.error("Error deleting board:", error);
    }
}

async function deleteNote(noteId) {
    try {
        await deleteDoc(doc(db, "notes", noteId));
        console.log("Note deleted: ", noteId);
    } catch (error) {
        console.error("Error deleting note:", error);
    }
}

async function deleteComment(noteId, commentId) {
    try {
        await deleteDoc(doc(db, "notes", noteId, "comments", commentId));
        console.log("Comment deleted: ", commentId);
    } catch (error) {
        console.error("Error deleting comment:", error);
    }
}

function setupNotesPage(user) {
    const boardId = getBoardIdFromUrl();
    if (!boardId) {
        alert("No board ID provided.");
        window.location.href = "boards.html";
        return;
    }

    loadBoardInfo(boardId);
    displayNotes(boardId);

    // Setup add note
    const addNoteButton = document.getElementById("addNoteButton");
    const noteInputContainer = document.getElementById("noteInputContainer");
    const postNoteButton = document.getElementById("postNoteButton");

    addNoteButton.addEventListener("click", () => {
        noteInputContainer.style.display = noteInputContainer.style.display === "none" ? "block" : "none";
    });

    postNoteButton.addEventListener("click", async () => {
        const content = document.getElementById("noteContent").value.trim();
        if (content) {
            await addNote(boardId, content, user);
            document.getElementById("noteContent").value = "";
            noteInputContainer.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    setupGoogleSignIn();

    onAuthStateChanged(auth, (user) => {
        guardBoardsRoute(user);
        if (user && window.location.pathname.endsWith("boards.html")) {
            setupNavbar(user);
            loadBoards(user);

            // Setup board creation
            const createButton = document.getElementById("createButton");
            const createForm = document.getElementById("createForm");
            createButton.addEventListener("click", async () => {
                const name = document.getElementById("boardCreate").value.trim();
                if (name) {
                    await createBoard(name, user);
                    createForm.reset();
                    loadBoards(user); // Refresh boards
                } else {
                    alert("Please enter a board name.");
                }
            });

            // Setup board joining
            const joinButton = document.getElementById("joinButton");
            const joinForm = document.getElementById("joinForm");
            joinButton.addEventListener("click", async () => {
                const boardId = document.getElementById("boardJoin").value.trim();
                if (boardId) {
                    await joinBoard(boardId, user);
                    joinForm.reset();
                    loadBoards(user); // Refresh boards
                } else {
                    alert("Please enter a board ID.");
                }
            });
        }
        if (user && window.location.pathname.endsWith("notes.html")) {
            setupNavbar(user); // For navbar
            setupNotesPage(user);
        }
    });
});

