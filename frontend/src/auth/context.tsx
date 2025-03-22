import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth } from "../configuration";
import { onAuthStateChanged, User } from "firebase/auth";
import { Shell } from "lucide-react";

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
}

// Create the context with a default value
export const AuthContext = createContext<AuthContextType>({
  user: null,
});

export const useAuthContext = () => useContext(AuthContext);

interface AuthContextProviderProps {
  children: ReactNode;
}

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        //console.log("user", user);
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>
      {loading ? (
        <div className="loading-container">
          <Shell className="w-5 h-5 animate-spin" />
        </div>
      ) : (
        <>{children}</>
      )}
    </AuthContext.Provider>
  );
};