import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD7b8_4JIR_ormXgBCniwP6FlURCDKNTdg",
  authDomain: "petplace-dv69c.firebaseapp.com",
  projectId: "petplace-dv69c",
  storageBucket: "petplace-dv69c.appspot.com",
  messagingSenderId: "285580531726",
  appId: "1:285580531726:web:370768542fe02481de045f"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configurar providers con scopes adicionales
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');