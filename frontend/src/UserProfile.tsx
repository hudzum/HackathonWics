import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './configuration'; // Your Firebase config
import { useAuthContext } from "./auth/context";

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import NewGroupForm from './NewGroupForm';

function UserProfile() {
  const { user } = useAuthContext(); // Get current auth user from context
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Function to fetch user data
    async function fetchUserData() {
      if (!user) {
        setLoading(false);
        console.log("No user is logged in");
        return; // No user is logged in
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          console.log("No user data found!");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [user]); // Re-run if the user changes

  if (loading) return <div>Loading user data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please log in to view your profile</div>;
  if (!userData) return <div>No user data found</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <p>Name: {userData.displayName}</p>
      <p>Email: {user.email}</p>

      <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Open</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create A New Fund</SheetTitle>
          
        </SheetHeader>
        <SheetDescription className ="hidden">
            Create a new fund to start Saving in your future
        </SheetDescription>
            <NewGroupForm />
        
          <SheetClose asChild>
            <Button type="submit">Save changes</Button>
          </SheetClose>
       
      </SheetContent>
    </Sheet>
      {/* Display other user data fields from Firestore */}
    </div>
  );
}

export default UserProfile;