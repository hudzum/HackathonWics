import { useState } from "react";
import { auth,db } from "../configuration";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import {setDoc, doc, getDoc, serverTimestamp} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export const useGoogleLogin = () => {
  const [errorGoogleLogin, setErrorGoogleLogin] = useState<any>(false);
  const [isPendingGoogleLogin, setIsPendingGoogleLogin] = useState(false);
  const provider = new GoogleAuthProvider();

let navigate = useNavigate();

  const googleLogin = async () => {
    setErrorGoogleLogin(null);
    setIsPendingGoogleLogin(true);

    try {
      const res = await signInWithPopup(auth, provider);
      if (!res) {
        return;
      }
      const user = res.user;
      await checkAndCreateUserDocument(user);
     
      navigate("/dashboard");

    } catch (error :any) {
      setErrorGoogleLogin(error.code);
      await signOut(auth);
    } finally {
      setIsPendingGoogleLogin(false);
    }
  };

  return { googleLogin, errorGoogleLogin, isPendingGoogleLogin };
};

async function checkAndCreateUserDocument(user:any) {
  const userRef = doc(db, "users", user.uid);
  
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    const userData = {
      displayName: user.displayName,
      email: user.email,
      createdAt: new Date(),
    };
    
    await setDoc(userRef, userData);
    console.log("New user document created");
  } else {
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    console.log("Existing user, updated last login");
  }
}