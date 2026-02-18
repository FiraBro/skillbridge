import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  FileText,
  Settings,
  Plus,
  TrendingUp,
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
    {
      icon: LayoutDashboard,
      label: "Feed",
      path: "/dashboard",
      group: "navigation",
    },
    {
      icon: Search,
      label: "Discovery",
      path: "/discovery",
      group: "navigation",
    },
    {
      icon: Briefcase,
      label: "Opportunities",
      path: "/jobs",
      group: "navigation",
    },
    {
      icon: FileText,
      label: "My Projects",
      path: profilePath,
      group: "career",
    },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const NavLink = ({ item }) => {
    const active = isActive(item.path);
    return (
      <Link to={item.path} className="relative group px-3 block">
        {active && (
          <div className="absolute left-0 top-1 bottom-1 w-1 rounded-r-full bg-primary" />
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10 font-medium transition-all duration-200",
            active
              ? "bg-primary/5 text-primary hover:bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
          )}
        >
          <item.icon
            className={cn(
              "h-[18px] w-[18px]",
              active ? "text-primary" : "opacity-70 group-hover:opacity-100",
            )}
          />
          <span className="text-sm">{item.label}</span>
        </Button>
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 self-start border-r bg-background/50 backdrop-blur-sm overflow-hidden">
      {/* Scrollable Navigation Area - Added pt-8 for top spacing since header is gone */}
      <div className="flex-1 overflow-y-auto pt-8 pb-6 space-y-8">
        <section className="space-y-1">
          <p className="px-6 mb-3 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">
            Overview
          </p>
          {navItems
            .filter((i) => i.group === "navigation")
            .map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
        </section>

        <section className="space-y-1">
          <p className="px-6 mb-3 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">
            Growth & Projects
          </p>
          {navItems
            .filter((i) => i.group === "career")
            .map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
        </section>

        <section className="space-y-1">
          <p className="px-6 mb-3 text-[11px] font-bold text-muted-foreground/50 uppercase tracking-[0.15em]">
            System
          </p>
          {navItems
            .filter((i) => i.group === "other")
            .map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
        </section>
      </div>

      {/* Footer Area (Fixed at bottom) */}
      <div className="p-4 space-y-4 border-t bg-muted/10 flex-shrink-0">
        <div className="p-4 rounded-xl border bg-card/50 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
              Reputation
            </span>
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight">
              {user?.reputation || 0}
            </span>
            <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-bold">
              +2.4%
            </span>
          </div>
        </div>

        <Link to="/posts/create" className="block">
          <Button className="w-full h-11 shadow-md shadow-primary/10 font-semibold gap-2 transition-all hover:translate-y-[-0.5px] active:scale-95">
            <Plus className="h-4 w-4" />
            <span>New Insight</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
