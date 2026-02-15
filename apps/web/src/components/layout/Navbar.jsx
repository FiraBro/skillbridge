import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
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

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const trimmedQuery = searchQuery.trim();

  // Helper to navigate and reset search
  const handleSelection = (path) => {
    navigate(path);
    setSearchQuery("");
  };

  /* =========================
     SEARCH LOGIC
  ========================= */
  // Only search if user types 2+ characters to prevent showing everything by default
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

  /* =========================
     CMD + K FOCUS
  ========================= */
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearchSubmit(e);
                }}
              />

              {isQueryValid && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-background shadow-lg z-50 max-h-96 overflow-auto py-2">
                  {(devLoading || jobLoading) && (
                    <p className="p-3 text-sm text-muted-foreground animate-pulse">
                      Searching...
                    </p>
                  )}

                  {/* Developers Results */}
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
                          className="w-full text-left px-4 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-sm flex justify-between"
                        >
                          <span>{dev.name}</span>
                          <span className="text-emerald-600 text-xs">
                            @{dev.username}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Jobs Results */}
                  {!jobLoading && jobs.length > 0 && (
                    <div className="border-t pt-2">
                      <p className="px-3 py-1 text-[10px] font-bold text-muted-foreground uppercase">
                        Jobs
                      </p>
                      {jobs.slice(0, 5).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => handleSelection(`/jobs/${job.id}`)}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-sm"
                        >
                          {job.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Friendly Empty State */}
                  {!devLoading &&
                    !jobLoading &&
                    developers.length === 0 &&
                    jobs.length === 0 && (
                      <div className="p-4 text-center">
                        <Frown className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground font-medium">
                          No results for "{trimmedQuery}"
                        </p>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
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
                  <User className="mr-2 h-4 w-4" /> Public Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
}
