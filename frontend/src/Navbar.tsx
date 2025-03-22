import { NavLink } from "react-router";


// Import shadcn components
import {
  NavigationMenu,
  NavigationMenuItem,

  NavigationMenuList,

} from "@/components/ui/navigation-menu";


export function Navbar() {
  

  return (
    <div className=" drop-shadow-lg absolute top-0  sticky w-full border-b bg-zinc-50 backdrop-blur flex flex-row items-center justify-between px-6 h-17">

          <div className = "">
          <NavLink to="/" className="">
          <img src="./vite.svg" alt="Logo" className = "h-[100px]"/> 
          </NavLink>
          </div>
          <div className ="text-black font-bold flex items-center space-x-10">
          <NavigationMenu >
            <NavigationMenuList className="space-x-8">
             

              <NavigationMenuItem>
                <NavLink to="/dashboard">
                    Dashboard
                </NavLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        

          </div>
      
    </div>
    
  )
}
