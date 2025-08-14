import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";

// Firebase configuration (same as in your other files)
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
const auth = getAuth(app);
const db = getFirestore(app);

function createSession(user) {
  // Create a session using localStorage or sessionStorage
  localStorage.setItem('userSession', JSON.stringify({
    uid: user.uid,
    email: user.email,
    lastLogin: new Date().toISOString()
  }));
}

function checkSession() {
  const sessionData = localStorage.getItem('userSession');
  
  if (!sessionData) {
    // No session exists, redirect to login
    window.location.href = 'login.html';
    return null;
  }

  const session = JSON.parse(sessionData);
  
  // Optional: Check session expiration (e.g., 24 hours)
  const currentTime = new Date();
  const sessionTime = new Date(session.lastLogin);
  const hoursDifference = (currentTime - sessionTime) / (1000 * 60 * 60);

  if (hoursDifference > 24) {
    // Session expired
    localStorage.removeItem('userSession');
    window.location.href = 'login.html';
    return null;
  }

  return session;
}

function updateHeaderContent() {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Create or refresh session
      createSession(user);

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // Get full name
          const fullName = userDocSnap.data().fullname || user.displayName || 'User';
          
          // Get today's date
          const today = new Date();
          const formattedDate = today.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          });

          // Update header content
          const headerName = document.querySelector('.header-text h1');
          const headerDate = document.querySelector('.header-text p');

          if (headerName) headerName.textContent = `Hello, ${fullName}`;
          if (headerDate) headerDate.textContent = formattedDate;
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      }
    } else {
      // No user authenticated, check session
      const session = checkSession();
      if (!session) {
        window.location.href = 'login.html';
      }
    }
  });
}

// Add logout functionality
function logout() {
  // Remove session from localStorage
  localStorage.removeItem('userSession');
  
  // Sign out from Firebase
  auth.signOut().then(() => {
    // Redirect to login page
    window.location.href = 'login.html';
  }).catch((error) => {
    console.error('Logout error', error);
  });
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', () => {
  updateHeaderContent();

  // Optional: Add logout button functionality
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('touchstart', logout);
  }
});




// Progress Circle
function setProgress(percentage) {
  const circle = document.querySelector(".radial-indicator");
  const radius = circle.r.baseVal.value;
  const halfCircumference = radius * Math.PI;

  circle.style.strokeDasharray = `${halfCircumference} ${halfCircumference}`;
  const offset =
    halfCircumference - (percentage / 100) * halfCircumference;
  circle.style.strokeDashoffset = offset;
}

setProgress(40);




document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.container');
  const backdrop = document.createElement('div');
  backdrop.classList.add('backdrop');
  document.body.appendChild(backdrop);

  // Function to open container
  function openContainer() {
      container.classList.add('slide-up');
      backdrop.classList.add('show');
  }

  // Prevent touch interactions
  container.addEventListener('touchstart', (e) => {
      e.preventDefault();
  }, { passive: false });

  container.addEventListener('touchmove', (e) => {
      e.preventDefault();
  }, { passive: false });


  const openTrigger = document.querySelector('.top-section'); 
  if (openTrigger) {
      openTrigger.addEventListener('click', openContainer);
  }

  setTimeout(openContainer, 100); 
});
