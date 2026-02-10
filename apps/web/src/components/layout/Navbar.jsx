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

  /* =========================
   DEVELOPERS SEARCH
========================= */
  // Pass an empty object {} instead of null if trimmedQuery is empty
  const { developers, isLoading: devLoading } = useDeveloperDiscovery(
    trimmedQuery ? { search: trimmedQuery } : {},
  );

  // Note: In the previous step we updated the hook to return 'developers' directly
  // so you don't need 'devResponse?.data?.data' anymore.

  // const developers = devResponse?.data?.data || [];

  /* =========================
     JOBS SEARCH
  ========================= */
  const { data: jobsData, isLoading: jobLoading } = useJobs(
    trimmedQuery ? { search: trimmedQuery } : null,
  );

  const jobs = jobsData?.data || [];

  /* =========================
     SEARCH SUBMIT
  ========================= */
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!trimmedQuery) return;
      navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    },
    [trimmedQuery, navigate],
  );

  /* =========================
     CMD / CTRL + K
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
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold tracking-tight">
              SKILL<span className="text-emerald-600">BRIDGE</span>
            </span>
          </Link>

          {/* Search */}
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

              {trimmedQuery && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-background shadow-lg z-50 max-h-96 overflow-auto">
                  {(devLoading || jobLoading) && (
                    <p className="p-3 text-sm text-muted-foreground">
                      Searching...
                    </p>
                  )}

                  {/* Developers */}
                  {developers.length > 0 && (
                    <>
                      <p className="px-3 pt-2 text-xs font-semibold text-muted-foreground">
                        Developers
                      </p>
                      {developers.slice(0, 3).map((dev) => (
                        <button
                          key={dev._id}
                          onClick={() => navigate(`/profile/${dev.username}`)}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                        >
                          {dev.name} • ⭐ {dev.reputation_score ?? 0}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Jobs */}
                  {jobs.length > 0 && (
                    <>
                      <p className="px-3 pt-2 text-xs font-semibold text-muted-foreground">
                        Jobs
                      </p>
                      {jobs.slice(0, 3).map((job) => (
                        <button
                          key={job.id}
                          onClick={() => navigate(`/jobs/${job.id}`)}
                          className="w-full text-left px-3 py-2 hover:bg-muted text-sm"
                        >
                          {job.title}
                        </button>
                      ))}
                    </>
                  )}

                  {!devLoading &&
                    !jobLoading &&
                    developers.length === 0 &&
                    jobs.length === 0 && (
                      <p className="p-3 text-sm text-muted-foreground">
                        No results found
                      </p>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center space-x-3">
            <Link to="/jobs" className="hidden lg:block">
              <Button variant="ghost" size="sm">
                <Briefcase className="mr-2 h-4 w-4" />
                Opportunities
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
                <Button variant="ghost" className="h-9 w-9 rounded-full p-0">
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
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate(`/profile/${user?.username || "me"}`)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Public Profile
                </DropdownMenuItem>

                {user?.role === "admin" && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />

                <DropdownMenuItem className="text-destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
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
