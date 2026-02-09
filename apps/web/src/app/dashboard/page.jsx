import React, { Suspense } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageSquare,
  Bookmark,
  Clock,
  MoreHorizontal,
  Share2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ActivityFeed from "./components/activity-feed";
import { useNavigate } from "react-router-dom";

export default function CommunityPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#F5F5F5] dark:bg-zinc-950 font-sans">
      {/* 1. Navbar - Clean & Flat */}
      <header className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 h-16 flex items-center">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold tracking-tighter text-[#108a00]">
              Community
            </span>
            <nav className="hidden md:flex gap-6 text-sm font-medium text-zinc-600">
              <Link href="#" className="hover:text-[#108a00]">
                Discussions
              </Link>
              <Link href="#" className="hover:text-[#108a00]">
                Tutorials
              </Link>
              <Link href="#" className="hover:text-[#108a00]">
                Showcase
              </Link>
            </nav>
          </div>
          <Button
            onClick={() => navigate("/posts/create")}
            className="bg-[#108a00] hover:bg-[#0d7300] text-white rounded-md font-bold px-6"
          >
            Create Post
          </Button>
        </div>
      </header>

      {/* 2. Main Feed Container */}
      <main className="max-w-[720px] mx-auto py-6">
        {/* Filter Headers - Dev.to Style */}
        <div className="flex gap-1 mb-2 px-2 sm:px-0">
          <FilterButton label="Relevant" active />
          <FilterButton label="Latest" />
          <FilterButton label="Top" />
        </div>

        <div className="space-y-4">
          <Suspense fallback={<PostSkeleton />}>
            {/* The ActivityFeed would map through components like CommunityPost below */}
            <ActivityFeed />

            {/* EXAMPLE OF WHAT A POST LOOKS LIKE NOW */}
            <CommunityPost
              hasImage
              title="How to integrate AI into your Freelance Workflow using React"
              tags={["react", "ai", "freelancing"]}
              author="Jemal Firagos"
              date="Oct 24"
              readingTime="5 min read"
              coverImage="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

/**
 * COMPONENT: CommunityPost (Dev.to + Upwork Style)
 */
function CommunityPost({
  hasImage,
  title,
  tags,
  author,
  date,
  readingTime,
  coverImage,
}) {
  return (
    <Card className="border-zinc-200 dark:border-zinc-800 shadow-none rounded-none sm:rounded-md overflow-hidden bg-white dark:bg-zinc-900 group cursor-pointer">
      {/* Cover Image - Top of card like Dev.to */}
      {hasImage && (
        <div className="w-full h-64 overflow-hidden">
          <img
            src={coverImage}
            alt="Cover"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      <div className="p-5 md:p-8">
        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-9 w-9 border border-zinc-100">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${author}`}
            />
            <AvatarFallback>JF</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 p-1 -m-1 rounded transition-colors">
              {author}
            </span>
            <span className="text-xs text-zinc-500">{date}</span>
          </div>
        </div>

        {/* Post Title */}
        <div className="pl-0 md:pl-12">
          <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 leading-tight mb-3 group-hover:text-[#108a00] transition-colors">
            {title}
          </h2>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-all border border-transparent hover:border-zinc-200"
              >
                <span className="text-zinc-400">#</span>
                {tag}
              </span>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-zinc-100 text-zinc-600 gap-2 px-3"
              >
                <Heart className="h-5 w-5" />
                <span className="hidden sm:inline">24 Reactions</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-zinc-100 text-zinc-600 gap-2 px-3"
              >
                <MessageSquare className="h-5 w-5" />
                <span className="hidden sm:inline">12 Comments</span>
              </Button>
            </div>

            <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
              <span>{readingTime}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 hover:bg-zinc-100"
              >
                <Bookmark className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function FilterButton({ label, active }) {
  return (
    <button
      className={`px-4 py-2 rounded-md text-lg transition-colors ${
        active
          ? "bg-white dark:bg-zinc-900 font-bold text-zinc-900 dark:text-zinc-50 shadow-sm"
          : "text-zinc-600 hover:text-[#108a00] hover:bg-white/50"
      }`}
    >
      {label}
    </button>
  );
}

function PostSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2].map((n) => (
        <Card
          key={n}
          className="p-8 bg-white dark:bg-zinc-900 border-zinc-200 shadow-none space-y-4"
        >
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </Card>
      ))}
    </div>
  );
}
