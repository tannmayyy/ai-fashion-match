import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  NextOrObserver
} from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';

// =================================================================================
// 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
//
//                                 !!! IMPORTANT !!!
//                       ACTION REQUIRED: CONFIGURE FIREBASE
//
// 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥
//
// THIS APP WILL NOT WORK CORRECTLY WITH THESE PLACEHOLDER VALUES.
//
// To get started:
//
// 1. Go to the Firebase Console: https://console.firebase.google.com/
// 2. Create a new project (or use an existing one).
// 3. In your project, go to Project Settings (click the ⚙️ icon).
// 4. Under the "General" tab, scroll down to "Your apps".
// 5. Click the web icon (</>) to create a new web app or select your existing one.
// 6. Find and copy the `firebaseConfig` object.
// 7. Paste it below, replacing the entire `firebaseConfig` placeholder object.
// 8. In the Firebase Console, go to "Authentication" -> "Sign-in method" and
//    ENABLE the "Email/Password" provider.
// 9. In the Firebase Console, go to "Firestore Database" and create a database.
//
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAGlYMYpDtkjDizcRERjo4d5ZMDmDhni-o",
  authDomain: "ai-fashion-app-5a0f4.firebaseapp.com",
  projectId: "ai-fashion-app-5a0f4",
  storageBucket: "ai-fashion-app-5a0f4.firebasestorage.app",
  messagingSenderId: "550421407639",
  appId: "1:550421407639:web:cea3b7fa52e855766306d2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * Signs up a new user with email and password and creates a user document in Firestore.
 * @param email - The user's email.
 * @param password - The user's password.
 * @param username - The user's chosen display name.
 * @returns A promise that resolves with the user credential.
 */
export const signUpUser = async (email: string, password: string, username: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update Firebase Auth profile with the username
  await updateProfile(user, { displayName: username });
  
  // Create a document for the new user in the 'users' collection
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email: user.email,
    username: username,
    createdAt: serverTimestamp()
  });
  
  return userCredential;
};

/**
 * Signs in an existing user with email and password.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns A promise that resolves with the user credential.
 */
export const signInUser = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Signs out the current user.
 * @returns A promise that resolves when the user is signed out.
 */
export const signOutUser = () => {
  return signOut(auth);
};

/**
 * Subscribes to authentication state changes.
 * @param callback - The function to call when the auth state changes.
 * @returns The unsubscribe function.
 */
export const onAuthObserver = (callback: NextOrObserver<User | null>) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Submits user feedback to the 'feedback' collection in Firestore.
 * @param userId - The UID of the user submitting feedback.
 * @param userEmail - The email of the user submitting feedback.
 * @param feedbackType - The category of feedback.
 * @param message - The feedback message content.
 */
export const submitFeedback = async (
  userId: string,
  userEmail: string | null,
  feedbackType: string,
  message: string
) => {
  try {
    await addDoc(collection(db, "feedback"), {
      userId: userId,
      userEmail: userEmail,
      feedbackType: feedbackType,
      message: message,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error writing feedback to Firestore: ", error);
    // Re-throw the error to be handled by the component
    throw new Error("Could not submit feedback. Please try again later.");
  }
};