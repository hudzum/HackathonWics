import { useState } from "react";
import { auth, db } from "../configuration";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { setDoc,doc,serverTimestamp } from "firebase/firestore";

export const useEmailPasswordLogin = () => {
  const [errorEmailPasswordLogin, setErrorEmailPasswordLogin] = useState(null);
  const [isPendingEmailPasswordLogin, setIsPendingEmailPasswordLogin] =
    useState(false);

  let navigate = useNavigate();
  const emailPasswordLogin = async (email:string, password:string) => {
    setErrorEmailPasswordLogin(null);
    setIsPendingEmailPasswordLogin(true);

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      if (!res.user) {
        return;
      }
      const user = res.user;

      navigate("/dashboard");
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
      console.log("Existing user, updated last login");

    } catch (error: any) {
      setErrorEmailPasswordLogin(error.code);
      await signOut(auth);
    } finally {
      setIsPendingEmailPasswordLogin(false);
    }
  };

  return {
    emailPasswordLogin,
    errorEmailPasswordLogin,
    isPendingEmailPasswordLogin,
  };
};