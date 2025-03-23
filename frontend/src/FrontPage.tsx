import SignIn from "./SignIn";
import { Navbar } from "./Navbar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "./components/ui/button";
import Squares from "./components/ui/Squares";
import Hero3DModel from "./Hero3DModel";
/*
const handleAnimationComplete = () => {
  console.log("All letters have animated!");
};*/
import { FolderGit2 } from "lucide-react";

export default function FrontPage() {
  const glassParts = ["jar", "jar_rigid_body_top", "jar_rigid_body_bottom"];

  return (
    <div className="relative min-h-screen">
      {/* Squares background with absolute positioning */}
      <div className="fixed inset-0 z-0">
        <Squares
          speed={0.2}
          squareSize={40}
          direction="diagonal"
          borderColor="#fff"
          hoverFillColor="#222"
          enableGradient={false}
        />
      </div>

      {/* Content positioned above the background */}
      <div className="relative z-10">
        <Navbar />

        <div className="flex flex-col lg:flex-row min-h-screen">
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center py-8 -mt-40 ">
            <div className="text-center space-y-6">
              <main className="text-4xl md:text-6xl font-bold">
                <h1 className="inline">
                  <span className="inline bg-gradient-to-r from-[#F596D3] to-[#D247BF] text-transparent bg-clip-text">
                    CoinCache
                  </span>{" "}
                  Gamify <br />
                  Saving, Reach
                </h1>{" "}
                <br />
                for{" "}
                <h2 className="inline">
                  <span className="inline bg-gradient-to-r from-[#61DAFB] via-[#1fc0f1] to-[#03a3d7] text-transparent bg-clip-text">
                    Goals
                  </span>{" "}
                  Together!
                </h2>
              </main>

              <p className="text-xl text-muted-foreground md:w-10/12 mx-auto">
                Saving money has never been this fun!
              </p>

              <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row justify-center">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button className = "w-full md:w-1/3">Get Started</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Register or Login</SheetTitle>
                    </SheetHeader>
                    <SheetDescription className="hidden">
                      Create a new fund to start Saving in your future
                    </SheetDescription>
                    <SignIn />

                    
                  </SheetContent>
                </Sheet>
              

                <Button variant="secondary" onClick={() => window.open("https://github.com/your-repo-link", "_blank")}
    >
                  Github Repository <FolderGit2 className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Right side: 3D Model */}
          <div className="w-full lg:w-1/2 h-96 lg:h-auto relative">
            <div className="absolute inset-0">
              <Hero3DModel
                modelPath="./coinsfalling3.glb"
                modelScale={1}
                modelPosition={[0, -1.1, 0]}
                modelRotation={[0, 0, 0]}
                enableTiltAnimation={true}
                canvasHeight="100%"
                partMaterials={glassParts}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
