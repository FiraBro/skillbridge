import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bell,
  User,
  Briefcase,
  LogOut,
  LayoutDashboard,
  Search,
  Frown,
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
import { useJobs } from "@/hooks/useJobs";
import { useDeveloperDiscovery } from "@/hooks/useDeveloper";
// --- NEW IMPORT ---
import { NotificationDropdown } from "../NotificationCenter";
export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const trimmedQuery = searchQuery.trim();

  const handleSelection = (path) => {
    navigate(path);
    setSearchQuery("");
    setIsNotificationsOpen(false); // Close dropdowns on nav
  };

  /* =========================
     SEARCH & CMD+K LOGIC
  ========================= */
  const isQueryValid = trimmedQuery.length >= 2;
  const { developers: devResponse, isLoading: devLoading } =
    useDeveloperDiscovery(
      isQueryValid ? { search: trimmedQuery } : { search: "" },
    );
  const { data: jobsData, isLoading: jobLoading } = useJobs(
    isQueryValid ? { search: trimmedQuery } : null,
  );

  const developers = devResponse || [];
  const jobs = jobsData?.data || [];

  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!trimmedQuery) return;
      handleSelection(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    },
    [trimmedQuery],
  );

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        document.getElementById("navbar-search")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
          <Link
            to="/"
            onClick={() => setSearchQuery("")}
            className="flex items-center space-x-2"
          >
            <span className="text-lg font-bold tracking-tight">
              SKILL<span className="text-emerald-600">BRIDGE</span>
            </span>
          </Link>

          {/* Search Bar (Hidden on Mobile) */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="navbar-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search developers or jobs..."
                className="pl-10 h-9"
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(e)}
              />

              {isQueryValid && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-background shadow-lg z-50 max-h-96 overflow-auto py-2">
                  {(devLoading || jobLoading) && (
                    <p className="p-3 text-sm animate-pulse">Searching...</p>
                  )}
                  {!devLoading && developers.length > 0 && (
                    <div className="pb-2">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                        Developers
                      </p>
                      {developers.slice(0, 5).map((dev) => (
                        <button
                          key={dev.id}
                          onClick={() =>
                            handleSelection(
                              `/profile/${dev.username || dev.id}`,
                            )
                          }
                          className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-sm flex justify-between"
                        >
                          <span>{dev.name}</span>
                          <span className="text-emerald-600 text-xs">
                            @{dev.username}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Jobs Section */}
                  {!jobLoading && jobs.length > 0 && (
                    <div className="pb-2 border-t mt-2 pt-2">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                        Jobs
                      </p>
                      {jobs.slice(0, 5).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => handleSelection(`/jobs/${job.id}`)}
                          className="w-full text-left px-4 py-2 hover:bg-emerald-50 text-sm flex flex-col"
                        >
                          <span className="font-medium">{job.title}</span>
                          <span className="text-muted-foreground text-xs">
                            {job.company_name || "Company"}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {!devLoading &&
                    !jobLoading &&
                    developers.length === 0 &&
                    jobs.length === 0 && (
                      <div className="p-4 text-center">
                        <Frown className="h-6 w-6 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No results</p>
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link to="/jobs">
              <Button variant="ghost" size="sm" className="hidden lg:flex">
                <Briefcase className="mr-2 h-4 w-4" /> Opportunities
              </Button>
            </Link>

            {/* --- NOTIFICATION BUTTON & DROPDOWN --- */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={isNotificationsOpen ? "bg-accent" : ""}
              >
                <Bell className="h-5 w-5" />
              </Button>

              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
                onSeeAll={() => {
                  setIsNotificationsOpen(false);
                  navigate("/notifications");
                }}
              />
            </div>

            {/* <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-9 rounded-full p-0 border"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/profile/${user?.username || "me"}`)}
                >
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}

            {/* Change the DropdownMenu root to be non-modal to prevent scrollbar hiding */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-9 w-9 rounded-full p-0 border focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              {/* Add a slight slide-up animation and ensure it doesn't shift layout */}
              <DropdownMenuContent
                align="end"
                className="w-60 mt-1"
                onCloseAutoFocus={(e) => e.preventDefault()} // Prevents page jumping back to trigger
              >
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate(`/profile/${user?.username || "me"}`)}
                >
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      {/* Spacer to prevent content from hiding under fixed navbar */}
      <div className="h-16" />
    </>
  );
}
