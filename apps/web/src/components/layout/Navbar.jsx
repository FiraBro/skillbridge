import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  User,
  Briefcase,
  Shield,
  LogOut,
  LayoutDashboard,
  Search,
  Command,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Helper to get initials for avatar fallback
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 transition-all hover:opacity-90 group"
          >
            {/* The Text */}
            <span className="text-lg font-bold tracking-tight text-slate-900">
              SKILL<span className="text-emerald-600">BRIDGE</span>
            </span>
          </Link>

          {/* Search - Center Balanced */}
          <div className="hidden md:flex flex-1 items-center justify-center px-8">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search talent or opportunities..."
                className="pl-10 pr-12 bg-muted/30 border-muted-foreground/20 hover:bg-muted/50 focus-visible:ring-1 focus-visible:ring-primary h-9 w-full transition-all"
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  navigate(`/search?q=${e.currentTarget.value}`)
                }
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 text-[10px] font-mono text-muted-foreground border rounded px-1.5 bg-background">
                <Command className="h-2.5 w-2.5" /> K
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            <Link to="/jobs" className="hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                className="font-medium text-muted-foreground hover:text-foreground"
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Opportunities
              </Button>
            </Link>

            <div className="h-4 w-[1px] bg-border hidden lg:block mx-1" />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0 overflow-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/20"
                >
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-muted text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-60 mt-2"
                align="end"
                sideOffset={5}
              >
                <DropdownMenuLabel className="p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold text-foreground leading-none">
                      {user?.name || "Member Account"}
                    </p>
                    <p className="text-xs font-medium leading-none text-muted-foreground">
                      {user?.email || "user@skillbridge.io"}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="py-2 cursor-pointer"
                  onClick={() => navigate("/dashboard")}
                >
                  <LayoutDashboard className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="py-2 cursor-pointer"
                  onClick={() => navigate(`/profile/${user?.username || "me"}`)}
                >
                  <User className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>Public Profile</span>
                </DropdownMenuItem>

                {user?.role === "admin" && (
                  <DropdownMenuItem
                    className="py-2 cursor-pointer"
                    onClick={() => navigate("/admin")}
                  >
                    <Shield className="mr-3 h-4 w-4 text-muted-foreground" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="py-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                  onClick={logout}
                >
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content overlap */}
      <div className="h-16" />
    </>
  );
}
