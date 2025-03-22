import SignIn from "./SignIn";
import { Navbar } from "./Navbar";
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
  import { Button } from "./components/ui/button";
export default function FrontPage() {


  return (
    <>
      <Navbar />
      <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Get Started</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create A New Fund</SheetTitle>
            </SheetHeader>
            <SheetDescription className="hidden">
              Create a new fund to start Saving in your future
            </SheetDescription>
            <SignIn/>

            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetContent>
        </Sheet>
    </>
  );
}