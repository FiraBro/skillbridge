import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, MessageSquare, Bookmark, Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ActivityFeed from "./components/activity-feed";

export default function CommunityPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100">
      {/* Navbar - Centered to match main content */}
      <header className="sticky top-0 z-40 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-4xl mx-auto px-4 md:px-6 h-16 md:h-18 flex items-center justify-end">
          <Button
            onClick={() => navigate("/posts/create")}
            className="rounded-full bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-all gap-2 px-5 md:px-6 h-9 md:h-10 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span className="font-semibold text-sm">Create</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 md:py-12 px-4 md:px-6">
        {/* Page Header */}
        <div className="space-y-1 mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight font-serif italic">
            The Feed
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
            Discover high-signal insights from the community.
          </p>
        </div>

        {/* Feed Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 md:space-y-8"
        >
          <Suspense fallback={<PostSkeleton />}>
            <ActivityFeed />
          </Suspense>
        </motion.div>
      </main>
    </div>
  );
}

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
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="group overflow-hidden border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 hover:shadow-xl transition-all">
        {hasImage && coverImage && (
          <div className="aspect-video md:aspect-[21/9] w-full overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
            />
          </div>
        )}

        <div className="p-5 md:p-10">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 md:h-10 md:w-10 ring-2 ring-zinc-100 dark:ring-zinc-800">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`}
                />
                <AvatarFallback>
                  {author?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-xs md:text-sm font-bold tracking-tight">
                  {author}
                </span>
                <span className="text-[10px] md:text-[11px] text-zinc-400 font-semibold uppercase tracking-widest mt-1">
                  {date} • {readingTime}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 md:opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug md:leading-[1.15] mb-4 group-hover:underline decoration-zinc-300 underline-offset-4">
            {title}
          </h2>

          <div className="flex flex-wrap gap-2 mb-6 md:mb-8">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] md:text-[12px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 px-2 py-0.5 md:px-3 md:py-1 rounded-md border border-zinc-100 dark:border-zinc-800"
              >
                #{tag.toUpperCase()}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-5 md:pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 group/btn cursor-pointer">
              <Heart className="h-4 w-4 md:h-5 md:w-5 group-hover/btn:fill-rose-500 group-hover/btn:text-rose-500 transition-all" />
              <span className="text-xs md:text-sm font-bold">{reactions}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 group/btn cursor-pointer">
              <MessageSquare className="h-4 w-4 md:h-5 md:w-5 group-hover/btn:text-zinc-900 dark:group-hover/btn:text-zinc-100 transition-colors" />
              <span className="text-xs md:text-sm font-bold">{comments}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function PostSkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2].map((n) => (
        <Card key={n} className="p-5 md:p-10 space-y-6">
          <div className="flex gap-4">
            <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 md:h-10 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      ))}
    </div>
  );
}
