import { useState } from "react";
import { auth } from "../configuration";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export const useGoogleLogin = () => {
  const [errorGoogleLogin, setErrorGoogleLogin] = useState<any>(false);
  const [isPendingGoogleLogin, setIsPendingGoogleLogin] = useState(false);
  const provider = new GoogleAuthProvider();

  const googleLogin = async () => {
    setErrorGoogleLogin(null);
    setIsPendingGoogleLogin(true);

    try {
      const res = await signInWithPopup(auth, provider);
      if (!res) {
        return;
      }
    } catch (error :any) {
      setErrorGoogleLogin(error.code);
      await signOut(auth);
    } finally {
      setIsPendingGoogleLogin(false);
    }
  };

  return { googleLogin, errorGoogleLogin, isPendingGoogleLogin };
};