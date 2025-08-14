import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-storage.js";

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
const storage = getStorage(app);
const provider = new GoogleAuthProvider();
const fb_porvider = new FacebookAuthProvider();

// Debugging function to log Firestore document
async function logFirestoreDocument(userId) {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      console.log("User document data:", userDocSnap.data());
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching document:", error);
  }
}

// Function to upload profile picture and get download URL
async function uploadProfilePicture(file, userId) {
  if (!file) return null;

  try {
    // Convert the file to base64
    const base64Image = await fileToBase64(file);

    // No need to store in Firebase Storage - will be stored directly in Firestore
    console.log("File converted to base64 successfully.");

    return base64Image;
  } catch (error) {
    console.error("Error converting profile picture to base64:", error);
    return null;
  }
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

// Image preview functionality
const profilePictureInput = document.getElementById("profilePicture");
const imagePreview = document.getElementById("imagePreview");

if (profilePictureInput && imagePreview) {
  profilePictureInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = function (e) {
        // Clear previous preview
        imagePreview.innerHTML = "";

        // Create image element
        const img = document.createElement("img");
        img.src = e.target.result;
        img.classList.add("preview-image");

        // Create remove button
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "Remove";
        removeBtn.classList.add("remove-image-btn");
        removeBtn.addEventListener("click", function (e) {
          e.preventDefault();
          imagePreview.innerHTML = "";
          profilePictureInput.value = "";
        });

        // Append elements
        imagePreview.appendChild(img);
        imagePreview.appendChild(removeBtn);
      };

      reader.readAsDataURL(file);
    }
  });
}

// --- Manual Registration ---
const manualSubmitBtn = document.getElementById("submit");
if (manualSubmitBtn) {
  manualSubmitBtn.addEventListener("click", async (event) => {
    event.preventDefault();

    // Ensure that the required elements exist
    const fullnameEl = document.getElementById("fullname");
    const roleEl = document.getElementById("role");
    const emailEl = document.getElementById("email");
    const phoneNumberEl = document.getElementById("phone_number");
    const passwordEl = document.getElementById("password");
    const profilePictureEl = document.getElementById("profilePicture");

    if (!fullnameEl || !roleEl || !emailEl || !passwordEl || !phoneNumberEl) {
      console.error("Registration form elements are missing.");
      return;
    }

    const fullname = fullnameEl.value;
    const role = roleEl.value;
    const email = emailEl.value;
    const phone_number = phoneNumberEl.value;
    const password = passwordEl.value;
    const profilePicture = profilePictureEl ? profilePictureEl.files[0] : null;

    try {
      // Show loading state
      manualSubmitBtn.disabled = true;
      manualSubmitBtn.textContent = "Registering...";

      // Create the user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Upload profile picture if provided
      let profilePictureUrl = null;
      if (profilePicture) {
        profilePictureUrl = await uploadProfilePicture(
          profilePicture,
          user.uid
        );
      }

      // Save user data in Firestore
      const userData = {
        fullname: fullname,
        role: role,
        email: email,
        phone_number: phone_number,
        uid: user.uid,
        status: "Pending",
      };

      if (profilePictureUrl) {
        userData.profile = profilePictureUrl;
      }

      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, userData);

      // Log the document to verify
      await logFirestoreDocument(user.uid);

      alert("User Registered Successfully!");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Full error:", error); // Log the full error object
      alert("Error: " + error.message);
      manualSubmitBtn.disabled = false;
      manualSubmitBtn.textContent = "Register";
    }
  });
}

// --- Google Login ---
const googleLoginBtn = document.getElementById("google-login-btn");
if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document already exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // If user exists, go to dashboard instead of login page
        window.location.href = "login.html";
      } else {
        await setDoc(userDocRef, {
          fullname: user.displayName || "",
          email: user.email,
          uid: user.uid,
          status: "Pending",
          profile: user.photoURL || null,
        });

        // Log the document to verify
        await logFirestoreDocument(user.uid);

        // Redirect to more_data.html to collect phone number and other missing info
        window.location.href = "more_data.html";
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
      const result = await signInWithPopup(auth, fb_porvider);
      const user = result.user;

      // Check if user document exists in Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // If user exists, go to dashboard instead of login page
        window.location.href = "login.html";
      } else {
        // Create a new user document with basic information
        await setDoc(userDocRef, {
          fullname: user.displayName || "",
          email: user.email,
          uid: user.uid,
          status: "Pending",
          // Temporarily store Facebook profile URL
          // This will be replaced with base64 if user uploads a new image
          profile: user.photoURL || null,
        });

        // Log the document to verify
        await logFirestoreDocument(user.uid);

        // Redirect to more_data.html to collect phone number
        window.location.href = "more_data.html";
      }
    } catch (error) {
      alert("Facebook sign in error: " + error.message);
    }
  });
}

// --- Additional Data Form Submission ---
const moreDataForm = document.getElementById("moreDataForm");
if (moreDataForm) {
  // Profile picture preview functionality for the additional data form
  const profilePictureInput = document.getElementById("profilePicture");
  const imagePreview = document.getElementById("imagePreview");

  if (profilePictureInput && imagePreview) {
    profilePictureInput.addEventListener("change", function () {
      const file = this.files[0];
      if (file) {
        const reader = new FileReader();

        reader.onload = function (e) {
          // Clear previous preview
          imagePreview.innerHTML = "";

          // Create image element
          const img = document.createElement("img");
          img.src = e.target.result;
          img.classList.add("preview-image");

          // Create remove button
          const removeBtn = document.createElement("button");
          removeBtn.textContent = "Remove";
          removeBtn.classList.add("remove-image-btn");
          removeBtn.addEventListener("click", function (e) {
            e.preventDefault();
            imagePreview.innerHTML = "";
            profilePictureInput.value = "";
          });

          // Append elements
          imagePreview.appendChild(img);
          imagePreview.appendChild(removeBtn);
        };

        reader.readAsDataURL(file);
      }
    });
  }

  moreDataForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullnameEl = document.getElementById("fullname");
    const roleEl = document.getElementById("role");
    const phoneNumberEl = document.getElementById("phone_number");
    const profilePictureEl = document.getElementById("profilePicture");

    if (!fullnameEl || !roleEl || !phoneNumberEl) {
      console.error("Additional data form elements are missing.");
      return;
    }

    const fullname = fullnameEl.value;
    const role = roleEl.value;
    const phone_number = phoneNumberEl.value;
    const profilePicture = profilePictureEl ? profilePictureEl.files[0] : null;

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Submit button loading state
          const submitBtn = moreDataForm.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "Saving...";
          }

          // Get existing user data first
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);
          let existingData = {};

          if (userDocSnap.exists()) {
            existingData = userDocSnap.data();
          }

          // Upload profile picture if provided
          let profilePictureUrl = null;
          if (profilePicture) {
            profilePictureUrl = await uploadProfilePicture(
              profilePicture,
              user.uid
            );
          }

          // Prepare user data
          const userData = {
            ...existingData, // Keep existing data
            fullname: fullname,
            role: role,
            email: user.email,
            phone_number: phone_number, // Add phone number
            uid: user.uid,
            status: "Pending",
          };

          // Add profile picture URL if available
          if (profilePictureUrl) {
            userData.profile = profilePictureUrl;
          } else if (!userData.profile && user.photoURL) {
            // Keep existing photo from auth provider if available
            userData.profile = user.photoURL;
          }

          // Update Firestore
          await setDoc(userDocRef, userData);

          // Log the document to verify
          await logFirestoreDocument(user.uid);

          alert("Profile completed successfully!");
          window.location.href = "login.html";
        } catch (error) {
          alert("Error saving profile: " + error.message);

          // Reset submit button
          const submitBtn = moreDataForm.querySelector('button[type="submit"]');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Save";
          }
        }
      } else {
        window.location.href = "login.html";
      }
    });
  });
}
