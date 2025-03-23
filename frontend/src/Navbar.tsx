import { NavLink } from "react-router";
import { useAuthContext } from "./auth/context"; // Adjust path as needed
import { useLogout } from "./auth/logout";
// Import shadcn components
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "./components/ui/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LogOut,
  User,
  Settings,
  Home,
  PlusCircle,
  HandCoins,
} from "lucide-react";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import SignIn from "./SignIn";
import NewGroupForm from "./NewGroupForm";

export function Navbar() {
  const { user } = useAuthContext(); // Assuming your auth context has these
  const { logout } = useLogout();
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.email) return "?";
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="drop-shadow-lg sticky top-0 z-50 w-full border-b backdrop-blur-md bg-background/80 flex flex-row items-center justify-between px-6 py-2">
      <div className="flex items-center">
        <NavLink to="/" className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-extrabold text-xl rounded-lg px-3 py-1 flex items-center">
            <HandCoins className="size-12" />
            <span className="ml-2">CoinCache</span>
          </div>
        </NavLink>
      </div>

      <div className="flex items-center space-x-4">
        <NavigationMenu>
          <NavigationMenuList className="space-x-1 md:space-x-4">
            <NavigationMenuItem>
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-foreground"
                  }`
                }
              >
                <div className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span className="hidden md:inline">Dashboard</span>
                </div>
              </NavLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <Sheet>
                <SheetTrigger asChild>
                  <div className="flex items-center gap-1 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden md:inline">New Fund</span>
                  </div>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Create A New Fund</SheetTitle>
                  </SheetHeader>
                  <SheetDescription className="hidden">
                    Create a new fund to start Saving in your future
                  </SheetDescription>
                  <NewGroupForm />

                  <SheetClose asChild>
                    <Button type="submit">Save changes</Button>
                  </SheetClose>
                </SheetContent>
              </Sheet>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <ThemeToggle />

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/10">
                  <AvatarImage
                    src={user.photoURL || undefined}
                    alt={user.displayName || "User"}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.displayName || user.email}
                  </p>
                  {user.displayName && (
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <NavLink
                  to="/dashboard"
                  className="flex items-center cursor-pointer"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <NavLink
                  to="/settings"
                  className="flex items-center cursor-pointer"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </NavLink>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="flex items-center text-red-500 focus:text-red-500 cursor-pointer"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Sign In</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Register or Login</SheetTitle>
              </SheetHeader>
              <SheetDescription className="hidden">
                Create a new fund to start Saving in your future
              </SheetDescription>
              <SignIn />

              <SheetClose asChild>
              
              </SheetClose>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
}
