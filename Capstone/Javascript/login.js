import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDgoc4Zx064nL1iydJbccI692HDpu8gLLE",
  authDomain: "capstone-project-312dc.firebaseapp.com",
  projectId: "capstone-project-312dc",
  storageBucket: "capstone-project-312dc.firebasestorage.app",
  messagingSenderId: "82712440613",
  appId: "1:82712440613:web:124a86e48a3b9c3e6bf4cc",
  measurementId: "G-YFF9RVYJ9C",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

// Common function to handle user document creation
async function createUserDocument(user, additionalData = {}) {
  try {
    await setDoc(doc(db, "users", user.uid), {
      ...additionalData,
      email: user.email,
      uid: user.uid,
      status: "Pending", 
    });
  } catch (error) {
    console.error("Error creating user document:", error);
    throw error;
  }
}

// --- Email/Password Login ---
const loginForm = document.querySelector('form');
if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailEl = document.getElementById('email');
    const passwordEl = document.getElementById('password');

    if (!emailEl || !passwordEl) {
      console.error('Login form elements are missing.');
      return;
    }

    const email = emailEl.value;
    const password = passwordEl.value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify user exists in Firestore and has Approved status
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        if (userData.status === "Approved") {
          alert("Login Successful!");
          window.location.href = "main_page.html";
        } else {
          // Logout the user
          await auth.signOut();
          alert("Your account is not yet approved. Please wait for admin approval.");
        }
      } else {
        // If user document doesn't exist, create it
        await createUserDocument(user);
        alert("Your account is pending approval. Please wait for admin verification.");
      }
    } catch (error) {
      alert("Login Error: " + error.message);
    }
  });
}

// --- Google Login ---
const googleLoginBtn = document.getElementById("google-login-btn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Check if user document already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        if (userData.status === "Approved") {
          window.location.href = "main_page.html";
        } else {
          // Logout the user
          await auth.signOut();
          alert("Your account is not yet approved. Please wait for admin approval.");
        }
      } else {
        await createUserDocument(user, {
          fullname: user.displayName || '',
        });
        alert("Your account is pending approval. Please wait for admin verification.");
      }
    } catch (error) {
      alert("Google sign in error: " + error.message);
    }
  });
}

// --- Facebook Login ---
const facebookLoginBtn = document.getElementById("facebook-login-btn");
if (facebookLoginBtn) {
  facebookLoginBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        if (userData.status === "Approved") {
          window.location.href = "main_page.html";
        } else {
          // Logout the user
          await auth.signOut();
          alert("Your account is not yet approved. Please wait for admin approval.");
        }
      } else {
        await createUserDocument(user, {
          fullname: user.displayName || '',
        });
        alert("Your account is pending approval. Please wait for admin verification.");
      }
    } catch (error) {
      alert("Facebook sign in error: " + error.message);
    }
  });
}