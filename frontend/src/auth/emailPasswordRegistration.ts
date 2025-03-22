import { useState } from "react";
import { auth,db } from "../configuration";
import { doc, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";


export const useEmailPasswordRegistration = () => {
  const [errorEmailPasswordRegistration, setErrorEmailPasswordRegistration] =
    useState(null);
  const [isPendingEmailPasswordRegistration, setIsPendingEmailRegistration] =
    useState(false);

  let navigate = useNavigate();
  const emailPasswordRegistration = async (email:string, password:string, ) => {
    setErrorEmailPasswordRegistration(null);
    setIsPendingEmailRegistration(true);
  
 

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      if (!res.user) {
        return;
      }

      const user = res.user;

      //Adding that shi into db
      await setDoc(doc(db, "users", user.uid), {
        displayName: extractNameFromEmail(email),
        email: user.email,
        createdAt: new Date(),
      });
    
      console.log("New user document created");
      navigate("/dashboard");

    } catch (error:any) {
      setErrorEmailPasswordRegistration(error.code);
      await signOut(auth);
    } finally {
      setIsPendingEmailRegistration(false);
    }
  };

  return {
    emailPasswordRegistration,
    errorEmailPasswordRegistration,
    isPendingEmailPasswordRegistration,
  };
};

function extractNameFromEmail(email:string) {
  return email.split('@')[0];
}