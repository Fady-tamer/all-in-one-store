import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDf752ew03x5SlNn1dzqlh82SOKFNm3H68",
    authDomain: "software-project-allinone.firebaseapp.com",
    projectId: "software-project-allinone",
    storageBucket: "software-project-allinone.firebasestorage.app",
    messagingSenderId: "634736246042",
    appId: "1:634736246042:web:9ad6a1b7401e9408c280a3",
    measurementId: "G-9JXFZCVZWG"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// ==========================================
// UI LOGIC
// ==========================================

window.toggleForms = function() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
};

// ==========================================
// AUTHENTICATION & DATABASE LOGIC
// ==========================================

const signupForm = document.getElementById('signup-form');
signupForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            fullName: name,
            email: email,
            role: "customer",
            createdAt: new Date()
        });

        alert(`Account created successfully!`);
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';

    } catch (error) {
        alert("Error signing up: " + error.message);
    }
});

const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Logged in successfully!");
            window.location.href = "../home.html";
        })
        .catch((error) => {
            alert("Email or Password is wrong. Please check your credentials. (" + error.message + ")");
        });
});