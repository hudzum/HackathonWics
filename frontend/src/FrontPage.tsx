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

import Squares from './components/ui/Squares';

export default function FrontPage() {
  return (
    <div className="relative min-h-screen">
      {/* Squares background with absolute positioning */}
      <div className="fixed inset-0 z-0">
        <Squares 
          speed={0.2} 
          squareSize={40}
          direction='diagonal'
          borderColor='#fff'
          hoverFillColor='#222'
          enableGradient={false} // Turn off gradient
        />
      </div>
      
      {/* Content positioned above the background */}
      <div className="relative z-10">
        <Navbar />
        
        <div className="flex justify-center items-center min-h-screen">
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

              <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit">Save changes</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}