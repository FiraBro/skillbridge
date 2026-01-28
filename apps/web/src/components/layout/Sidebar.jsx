import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  FileText,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();

  const profilePath = user?.username
    ? `/profile/${user.username}`
    : "/auth/login";

  const navItems = [
    { icon: LayoutDashboard, label: "Feed", path: "/dashboard", group: "main" },
    { icon: Search, label: "Discovery", path: "/discovery", group: "main" },
    { icon: Briefcase, label: "Opportunities", path: "/jobs", group: "main" },

    {
      icon: FileText,
      label: "My Projects",
      path: profilePath,
      group: "metrics",
    },

    {
      icon: Settings,
      label: "Settings",
      path: "/company/settings",
      group: "other",
    },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const renderGroup = (groupName) => (
    <div className="space-y-1">
      {navItems
        .filter((item) => item.group === groupName)
        .map((item) => (
          <Link key={item.label} to={item.path}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 h-11 font-medium transition-all group",
                isActive(item.path)
                  ? "bg-primary/10 text-primary hover:bg-primary/15"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5",
                  isActive(item.path)
                    ? "text-primary"
                    : "group-hover:text-foreground",
                )}
              />
              {item.label}
            </Button>
          </Link>
        ))}
    </div>
  );

  return (
    <aside className="hidden lg:flex flex-col w-64 h-[calc(100vh-4rem)] sticky top-16 p-6 space-y-8 border-r bg-card">
      <div className="space-y-4">
        <h4 className="px-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
          Navigation
        </h4>
        {renderGroup("main")}
      </div>

      <div className="space-y-4">
        <h4 className="px-4 text-xs font-bold tracking-widest text-muted-foreground uppercase">
          Career & Trust
        </h4>
        {renderGroup("metrics")}
      </div>

      <div className="mt-auto pt-4">
        <Link to="/posts/create">
          <Button className="w-full h-12 rounded-2xl font-black uppercase italic shadow-lg shadow-primary/20 gap-2 hover:scale-[1.02] active:scale-95 transition-all">
            <Plus className="h-4 w-4" /> Share Insight
          </Button>
        </Link>
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
          Current Reputation
        </p>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-2xl font-black text-primary">
            {user?.reputation || 0}
          </span>
          <span className="text-[10px] text-green-500 font-bold">Stable</span>
        </div>
      </div>
    </aside>
  );
}
