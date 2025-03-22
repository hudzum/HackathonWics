import { auth } from "../configuration"
import { signOut } from "firebase/auth"

export const useLogout = () => {
  const logout = async () => {
    try {
      await signOut(auth)
      console.log("user logged out")
    } catch (error :any) {
      console.log(error.message)
    }
  }

  return { logout }
}