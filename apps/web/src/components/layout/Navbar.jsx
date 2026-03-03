import { Link, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
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
  X,
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
import { NotificationDropdown } from "../NotificationCenter";
import { BrandLogo } from "../comman/BrandLogo";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const trimmedQuery = searchQuery.trim();
  const isQueryValid = trimmedQuery.length >= 2;

  const { developers: devResponse, isLoading: devLoading } =
    useDeveloperDiscovery(
      isQueryValid ? { search: trimmedQuery } : { search: "" },
    );

  const { data: jobsData, isLoading: jobLoading } = useJobs(
    isQueryValid ? { search: trimmedQuery } : null,
  );

  const developers = devResponse || [];
  const jobs = jobsData || [];

  const handleSelection = (path) => {
    navigate(path);
    setSearchQuery("");
    setIsNotificationsOpen(false);
    setIsSearchExpanded(false);
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 border-b bg-background/95 backdrop-blur-md transition-all duration-300">
        <div className="container mx-auto h-16 px-4 flex items-center justify-between gap-2 md:gap-4">
          {/* LOGO - Hidden when search is expanded on mobile */}
          {!isSearchExpanded && (
            <Link
              to="/app/dashboard"
              onClick={() => setSearchQuery("")}
              className="shrink-0"
            >
              <BrandLogo className="w-8 h-8 md:w-auto" />
            </Link>
          )}

          {/* SEARCH COMPONENT - Adapts width based on state */}
          <div
            className={`${isSearchExpanded ? "flex-1" : "flex-none md:flex-1"} flex justify-center transition-all duration-300`}
          >
            <div
              className={`relative w-full ${isSearchExpanded ? "max-w-full" : "max-w-[40px] md:max-w-md"}`}
            >
              {/* Mobile Search Toggle Trigger */}
              <Button
                variant="ghost"
                size="icon"
                className={`md:hidden absolute left-0 top-0 z-10 ${isSearchExpanded ? "hidden" : "flex"}`}
                onClick={() => setIsSearchExpanded(true)}
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* The actual Input */}
              <div
                className={`${isSearchExpanded ? "flex" : "hidden md:flex"} items-center w-full relative`}
              >
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  autoFocus={isSearchExpanded}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="pl-10 h-10 w-full bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded-full"
                />
                {isSearchExpanded && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 md:hidden"
                    onClick={() => {
                      setIsSearchExpanded(false);
                      setSearchQuery("");
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>

              {/* SEARCH RESULTS DROPDOWN */}
              {isQueryValid && (
                <div className="absolute top-12 left-0 w-full bg-background border rounded-2xl shadow-2xl z-[100] max-h-[80vh] overflow-auto py-2 overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                  <SearchResults
                    devLoading={devLoading}
                    jobLoading={jobLoading}
                    developers={developers}
                    jobs={jobs}
                    handleSelection={handleSelection}
                  />
                </div>
              )}
            </div>
          </div>

          {/* RIGHT ACTIONS - Hidden when search expanded on mobile */}
          {!isSearchExpanded && (
            <div className="flex items-center gap-1 md:gap-3 shrink-0">
              <Link to="/app/jobs" className="hidden sm:block">
                <Button variant="ghost" size="sm" className="gap-2 font-medium">
                  <Briefcase className="h-4 w-4" />
                  <span className="hidden lg:inline">Jobs</span>
                </Button>
              </Link>

              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <NotificationDropdown
                  isOpen={isNotificationsOpen}
                  onClose={() => setIsNotificationsOpen(false)}
                />
              </div>

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-9 w-9 rounded-full p-0 overflow-hidden border"
                  >
                    <Avatar className="h-full w-full">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel>
                    <p className="text-sm font-bold truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate font-normal">
                      {user?.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      navigate(`/profile/${user?.username || "me"}`)
                    }
                  >
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    className="text-destructive font-bold"
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </nav>
      <div className="h-16" /> {/* Spacer */}
    </>
  );
}

// Sub-component for results to keep clean
function SearchResults({
  devLoading,
  jobLoading,
  developers,
  jobs,
  handleSelection,
}) {
  if (devLoading || jobLoading)
    return (
      <p className="p-4 text-center text-sm text-muted-foreground animate-pulse">
        Searching...
      </p>
    );

  const hasNoResults = developers.length === 0 && jobs.length === 0;
  if (hasNoResults)
    return (
      <div className="p-8 text-center">
        <Frown className="h-8 w-8 mx-auto mb-2 opacity-20" />
        <p className="text-sm font-medium text-muted-foreground">
          No matches found
        </p>
      </div>
    );

  return (
    <div className="space-y-4">
      {developers.length > 0 && (
        <div>
          <p className="px-4 py-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Developers
          </p>
          {developers.slice(0, 4).map((dev) => (
            <button
              key={dev.id}
              onClick={() => handleSelection(`/app/profile/${dev.username}`)}
              className="w-full flex items-center gap-3 px-4 py-2 hover:bg-muted transition-colors text-left"
            >
              <Avatar className="h-7 w-7">
                <AvatarImage src={dev.avatar} />
                <AvatarFallback>{dev.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate">{dev.name}</span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  @{dev.username}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
      {jobs.length > 0 && (
        <div className="border-t pt-2">
          <p className="px-4 py-1 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
            Jobs
          </p>
          {jobs.slice(0, 4).map((job) => (
            <button
              key={job.id}
              onClick={() => handleSelection(`/app/jobs/${job.id}`)}
              className="w-full px-4 py-2 hover:bg-muted transition-colors text-left flex flex-col"
            >
              <span className="text-sm font-bold truncate">{job.title}</span>
              <span className="text-[11px] text-muted-foreground truncate">
                {job.company_name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
