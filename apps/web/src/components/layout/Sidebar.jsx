import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  Plus,
  TrendingUp,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useReputation } from "@/hooks/useProfiles";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose, // Added this import
} from "@/components/ui/sheet";

export default function Sidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const { data: reputation } = useReputation(user?.id);

  const MAX_REPUTATION = 100;
  const repPercentage = ((reputation?.total ?? 0) / MAX_REPUTATION) * 100;

  const navItems = [
    {
      icon: LayoutDashboard,
      label: "Feed",
      path: "/app/dashboard",
      group: "navigation",
    },
    {
      icon: Briefcase,
      label: "Opportunities",
      path: "/app/jobs",
      group: "navigation",
    },
    {
      icon: FileText,
      label: "My Projects",
      path: user?.username ? `/app/profile/${user.username}` : "/auth/login",
      group: "career",
    },
  ];

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  // --- SUB-COMPONENT: NavLink ---
  const NavLink = ({ item, isMobile = false }) => {
    if (!item) return null;

    const active = isActive(item.path);

    const content = (
      <Link
        to={item.path}
        className={cn("relative group block", !isMobile && "px-3")}
      >
        {!isMobile && active && (
          <div className="absolute left-0 top-1 bottom-1 w-1 rounded-r-full bg-primary" />
        )}
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start gap-3 h-10 font-medium transition-all duration-200",
            active
              ? "bg-primary/5 text-primary hover:bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            isMobile && "h-12 text-base",
          )}
        >
          <item.icon
            className={cn(
              "h-[18px] w-[18px]",
              active ? "text-primary" : "opacity-70",
            )}
          />
          <span>{item.label}</span>
        </Button>
      </Link>
    );

    // If mobile, wrap in SheetClose to shut the drawer on click
    if (isMobile) {
      return <SheetClose asChild>{content}</SheetClose>;
    }

    return content;
  };

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 self-start border-r bg-background/50 backdrop-blur-sm overflow-hidden">
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
        </div>

        <div className="p-4 space-y-4 border-t bg-muted/10 flex-shrink-0">
          <div className="p-4 rounded-xl border bg-card/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
                Reputation
              </span>
              <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            </div>
            <span className="text-[10px] bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-bold">
              {repPercentage.toFixed(1)}%
            </span>
          </div>
          <Link to="/app/posts/create" className="block">
            <Button className="w-full h-11 shadow-md font-semibold gap-2 transition-all active:scale-95">
              <Plus className="h-4 w-4" />
              <span>New Insight</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-t z-50 px-4 flex items-center justify-around">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center gap-1"
            >
              <item.icon
                className={cn(
                  "h-6 w-6",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Mobile More Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1">
              <Menu className="h-6 w-6 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">
                More
              </span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[20px] px-6 pb-10">
            <SheetHeader className="mb-6 text-left">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              {navItems.map((item) => (
                <NavLink key={`mobile-${item.path}`} item={item} isMobile />
              ))}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl mb-4">
                  <span className="text-sm font-medium">Your Reputation</span>
                  <span className="text-sm font-bold text-green-600">
                    {repPercentage.toFixed(1)}%
                  </span>
                </div>
                {/* Added SheetClose here as well */}
                <SheetClose asChild>
                  <Link to="/app/posts/create" className="block">
                    <Button className="w-full h-12 rounded-xl text-base font-bold">
                      <Plus className="mr-2 h-5 w-5" /> New Insight
                    </Button>
                  </Link>
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
