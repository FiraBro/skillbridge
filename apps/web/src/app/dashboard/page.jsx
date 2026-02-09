import React, { Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, MessageSquare, Bookmark, LayoutGrid } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ActivityFeed from "./components/activity-feed";

export default function CommunityPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#09090b] font-sans">
      {/* Navbar - Increased max-width to 6xl for better alignment with wider feed */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-emerald-600 p-1.5 rounded-lg">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Community
              </span>
            </Link>
            <nav className="hidden md:flex gap-1">
              <NavTab label="Discussions" active />
              <NavTab label="Tutorials" />
              <NavTab label="Showcase" />
            </nav>
          </div>
          <Button
            onClick={() => navigate("/posts/create")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 transition-all active:scale-95"
          >
            Create Post
          </Button>
        </div>
      </header>

      {/* Main Content - Feed width increased to max-w-4xl (896px) */}
      <main className="max-w-4xl mx-auto py-8 px-4">
        {/* Filters and Header Stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl w-fit">
            <FilterTab label="Relevant" active />
            <FilterTab label="Latest" />
            <FilterTab label="Top" />
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-foreground">latest</span> insights
            from the network
          </div>
        </div>

        {/* Feed Logic */}
        <div className="space-y-6">
          <Suspense fallback={<PostSkeleton />}>
            <ActivityFeed />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

/**
 * Reusable Post Component
 */
export function CommunityPost({
  hasImage,
  title,
  tags = [],
  author,
  date,
  readingTime,
  coverImage,
  reactions = 0,
  comments = 0,
}) {
  return (
    <Card className="group overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-500/30 transition-all shadow-sm">
      {hasImage && coverImage && (
        <div className="aspect-[21/7] w-full overflow-hidden border-b">
          {" "}
          {/* Aspect ratio widened to 21/7 for widescreen */}
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-700"
          />
        </div>
      )}

      <div className="p-6 md:p-10">
        {" "}
        {/* Increased padding for wider layout */}
        <div className="flex items-center gap-3 mb-6">
          <Avatar className="h-11 w-11 ring-2 ring-background">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`}
            />
            <AvatarFallback>
              {author?.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {author}
            </span>
            <span className="text-xs text-zinc-500 font-medium">
              {date} • {readingTime}
            </span>
          </div>
        </div>
        <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-[1.2] mb-5 group-hover:text-emerald-600 transition-colors">
          {title}
        </h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-sm font-semibold text-zinc-500 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800/50 hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl h-11 px-4 hover:text-rose-500 hover:bg-rose-50 transition-colors"
            >
              <Heart className="h-5 w-5" />
              <span className="font-bold text-base">{reactions}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-xl h-11 px-4 hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="font-bold text-base">{comments}</span>
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 rounded-xl hover:bg-zinc-100"
          >
            <Bookmark className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// UI Helpers (Tabs & Skeletons)
const NavTab = ({ label, active }) => (
  <button
    className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors ${active ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"}`}
  >
    {label}
  </button>
);

const FilterTab = ({ label, active }) => (
  <button
    className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${active ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-700"}`}
  >
    {label}
  </button>
);

function PostSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((n) => (
        <Card
          key={n}
          className="p-10 bg-white dark:bg-zinc-900 border-zinc-200 shadow-none space-y-6"
        >
          <div className="flex gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-16 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
        </Card>
      ))}
    </div>
  );
}
