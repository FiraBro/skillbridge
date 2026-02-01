import React, { Suspense } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, Bookmark, Clock } from "lucide-react";

// UI Components (Shadcn UI style)
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ActivityFeed from "./components/activity-feed";

/**
 * HELPER: Format date to relative time (e.g., "2 days ago")
 * In a real app, you might use 'date-fns' or 'dayjs'
 */
const formatRelativeTime = (dateString) => {
  const now = new Date();
  const past = new Date(dateString);
  const diffInMs = now - past;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return "Today";
  if (diffInDays === 1) return "Yesterday";
  if (diffInDays < 30) return `${diffInDays} days ago`;
  return past.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-[#fff] text-[#171717]">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 h-14 flex items-center">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button className="bg-[#171717] hover:bg-[#17171] text-white">
              Create Post
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Main Feed Container */}
      <main className="max-w-3xl mx-auto px-0 sm:px-4 py-4 md:py-6">
        {/* Filter Headers */}
        <div className="flex gap-4 px-4 sm:px-0 mb-4">
          <button className="text-lg font-bold border-b-2 border-transparent hover:text-indigo-600">
            Relevant
          </button>
          <button className="text-lg text-gray-500 hover:text-indigo-600">
            Latest
          </button>
          <button className="text-lg text-gray-500 hover:text-indigo-600">
            Top
          </button>
        </div>

        <div className="space-y-3">
          <Suspense fallback={<PostSkeleton />}>
            <ActivityFeed />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((n) => (
        <Card key={n} className="p-5 bg-white space-y-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2 w-20" />
            </div>
          </div>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-4 w-1/3" />
        </Card>
      ))}
    </div>
  );
}
