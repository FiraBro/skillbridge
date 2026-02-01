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
            <Button className="bg-indigo-600 hover:bg-indigo-700">
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

/**
 * THE DEV.TO POST CARD
 * Pass 'post' object from your API mapping
 */
// export function DevToPostCard({ post }) {
//   console.log("post", post);
//   // Logic to handle missing data gracefully
//   const authorName = post?.author?.name || "Developer";
//   const authorUsername = post?.author?.username || "user";
//   const avatarUrl =
//     post?.author?.avatar ||
//     `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorUsername}`;
//   const postedAt = formatRelativeTime(post?.created_at || new Date());

//   return (
//     <Card className="bg-white border-gray-200 shadow-sm hover:ring-1 hover:ring-gray-300 transition-all rounded-none sm:rounded-lg overflow-hidden group">
//       {/* Optional: Cover Image (Only if exists) */}
//       {post?.cover_image && (
//         <Link to={`/posts/${post.id}`}>
//           <img
//             src={post.cover_image}
//             alt="cover"
//             className="w-full h-48 md:h-64 object-cover"
//           />
//         </Link>
//       )}

//       <div className="p-4 md:p-5">
//         {/* AUTHOR SECTION (Top Left) */}
//         <div className="flex items-start gap-3 mb-3">
//           <Link to={`/profile/${authorUsername}`} className="shrink-0">
//             <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gray-100 overflow-hidden hover:ring-2 hover:ring-indigo-100 transition-all">
//               <img
//                 src={avatarUrl}
//                 alt={authorName}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//           </Link>

//           <div className="flex flex-col">
//             <Link
//               to={`/profile/${authorUsername}`}
//               className="text-sm font-semibold text-gray-700 hover:bg-gray-100 px-1 rounded -ml-1 transition-all"
//             >
//               {authorName}
//             </Link>
//             <span className="text-xs text-gray-500">{postedAt}</span>
//           </div>
//         </div>

//         {/* POST CONTENT */}
//         <div className="md:pl-12">
//           <Link to={`/posts/${post?.id}`} className="block mb-2">
//             <h2 className="text-2xl md:text-3xl font-extrabold leading-tight text-gray-900 group-hover:text-indigo-700 transition-colors">
//               {post?.title || "How to build professional UIs like Dev.to"}
//             </h2>
//           </Link>

//           {/* TAGS SECTION */}
//           <div className="flex flex-wrap gap-1 mb-4">
//             {(post?.tags || ["webdev", "javascript", "career"]).map((tag) => (
//               <Link
//                 key={tag}
//                 to={`/t/${tag}`}
//                 className="text-sm text-gray-600 hover:bg-gray-100 hover:text-black border border-transparent hover:border-gray-200 px-2 py-1 rounded"
//               >
//                 <span className="opacity-60">#</span>
//                 {tag}
//               </Link>
//             ))}
//           </div>

//           {/* META INFO (Bottom Row) */}
//           <div className="flex justify-between items-center">
//             <div className="flex items-center gap-1">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-9 px-2 gap-2 text-gray-600 hover:bg-gray-100"
//               >
//                 <Heart className="h-5 w-5 text-red-500" />
//                 <span className="text-sm">
//                   {post?.reactions_count || 24}{" "}
//                   <span className="hidden sm:inline">reactions</span>
//                 </span>
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-9 px-2 gap-2 text-gray-600 hover:bg-gray-100"
//               >
//                 <MessageSquare className="h-5 w-5 text-gray-400" />
//                 <span className="text-sm">
//                   {post?.comments_count || 8}{" "}
//                   <span className="hidden sm:inline">comments</span>
//                 </span>
//               </Button>
//             </div>

//             <div className="flex items-center gap-2 text-xs text-gray-500">
//               <span className="flex items-center gap-1">
//                 {post?.reading_time || 5} min read <Clock className="h-3 w-3" />
//               </span>
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 className="h-8 w-8 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600"
//               >
//                 <Bookmark className="h-5 w-5" />
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Card>
//   );
// }

/**
 * Skeleton Loader
 */
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
