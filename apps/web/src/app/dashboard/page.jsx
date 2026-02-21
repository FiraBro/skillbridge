import React, { Suspense } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
      {/* Navbar */}
      <header className="sticky top-0 z-49 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <nav className="hidden md:flex items-center gap-1">
              <NavTab label="Discussions" active />
              <NavTab label="Tutorials" />
              <NavTab label="Showcase" />
            </nav>
          </div>

          <Button
            onClick={() => navigate("/posts/create")}
            className="rounded-full bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 hover:opacity-90 transition-all gap-2 px-6"
          >
            <Plus className="h-4 w-4" />
            <span className="font-semibold">Create</span>
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-12 px-6">
        {/* Sub-Header & Filters */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight font-serif italic">
              The Feed
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
              Discover high-signal insights from the community.
            </p>
          </div>
        </div>

        {/* Feed Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
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
      <Card className="group overflow-hidden border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all">
        {hasImage && coverImage && (
          <div className="aspect-[21/9] w-full overflow-hidden">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
            />
          </div>
        )}

        <div className="p-8 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-zinc-100 dark:ring-zinc-800 transition-transform group-hover:scale-110">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`}
                />
                <AvatarFallback>
                  {author?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight">
                  {author}
                </span>
                <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-widest">
                  {date} • {readingTime}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-[1.15] mb-4 decoration-indigo-500/30 underline-offset-4 group-hover:underline">
            {title}
          </h2>

          <div className="flex flex-wrap gap-2 mb-8">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-[12px] font-bold text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 px-3 py-1 rounded-md border border-zinc-100 dark:border-zinc-800"
              >
                #{tag.toUpperCase()}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 transition-colors cursor-pointer">
              <Heart className="h-5 w-5 group-hover:fill-rose-500 group-hover:text-rose-500 transition-all" />
              <span className="text-sm font-bold">{reactions}</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-indigo-600 transition-colors cursor-pointer">
              <MessageSquare className="h-5 w-5" />
              <span className="text-sm font-bold">{comments}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

const NavTab = ({ label, active }) => (
  <button
    className={`px-5 py-2 text-[13px] font-bold transition-all relative ${active ? "text-black" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"}`}
  >
    {label}
    {active && (
      <motion.div
        layoutId="nav-underline"
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"
      />
    )}
  </button>
);

const FilterTab = ({ label, active, icon }) => (
  <button
    className={`flex items-center gap-2 px-5 py-1.5 text-xs font-bold rounded-full transition-all ${active ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
  >
    {icon}
    {label}
  </button>
);

function PostSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2].map((n) => (
        <Card key={n} className="p-10 space-y-6">
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </Card>
      ))}
    </div>
  );
}
