import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./configuration"; // Your Firebase config
import { useAuthContext } from "./auth/context";
import { Navbar } from "./Navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import NewGroupForm from "./NewGroupForm";
import ItemView from "./ItemView";

function UserProfile() {
  const { user } = useAuthContext(); // Get current auth user from context
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);

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
          const data = userSnap.data();
          setUserData(data);
          
          // Set first item as default selected if items exist
          if (data.items && data.items.length > 0) {
            setSelectedItemId(data.items[0].itemId);
          }
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

  if (loading) return <div className="flex justify-center items-center h-screen">Loading user data...</div>;
  if (error) return <div className="text-red-500 p-4">Error: {error}</div>;
  if (!user) return <div className="text-center p-8">Please log in to view your profile</div>;
  if (!userData) return <div className="text-center p-8">No user data found</div>;

  const handleItemSelect = (itemId) => {
    setSelectedItemId(itemId);
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto p-4 max-w-6xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">User Profile</CardTitle>
            <CardDescription>View and manage your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="font-medium">Name:</p>
                <p>{userData.displayName}</p>
              </div>
              <div className="space-y-2">
                <p className="font-medium">Email:</p>
                <p>{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">My Funds</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Create a New Fund</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Item</SheetTitle>
                <SheetDescription>
                  Create a new item to add to your collection.
                </SheetDescription>
              </SheetHeader>
              <NewGroupForm />
              <SheetFooter>
                <SheetClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {userData.items && userData.items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-nowrap overflow-x-auto pb-4 space-x-2">
              {userData.items.map((item) => (
                <Button
                  key={item.itemId}
                  variant={selectedItemId === item.itemId ? "default" : "outline"}
                  className="whitespace-nowrap"
                  onClick={() => handleItemSelect(item.itemId)}
                >
                  {item.itemName}
                </Button>
              ))}
            </div>
            
           
              {selectedItemId ? (
                <ItemView id={selectedItemId} />
              ) : (
                <div className="text-center p-8 text-gray-500">Select an item to view details</div>
              )}
            </div>
          
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <p className="text-gray-500 mb-4">You don't have any items yet.</p>
              <Sheet>
                <SheetTrigger asChild>
                  <Button>Create Your First Item</Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Create New Item</SheetTitle>
                    <SheetDescription>
                      Get started by creating your first item.
                    </SheetDescription>
                  </SheetHeader>
                  <NewGroupForm />
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button variant="ghost">Cancel</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}

export default UserProfile;