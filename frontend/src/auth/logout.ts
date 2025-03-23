import { auth } from "../configuration"
import { signOut } from "firebase/auth"
import { useNavigate } from "react-router-dom";
export const useLogout = () => {
  let navigate = useNavigate();
  const logout = async () => {
    try {
      await signOut(auth)
      console.log("user logged out")
      navigate("/")
    } catch (error :any) {
      console.log(error.message)
    }
  }

  return { logout }
}