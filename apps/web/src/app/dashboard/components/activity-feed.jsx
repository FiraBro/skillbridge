import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useInView } from "react-intersection-observer";
import {
  MessageSquare,
  Clock,
  ArrowRight,
  Heart,
  Share2,
  Send,
  MessageCircle,
  Copy,
  Zap,
  Flame,
} from "lucide-react";

import {
  usePosts,
  useToggleLikePost,
  useSharePost,
  useToggleFollow,
} from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

/**
 * 1. MEMOIZED POST CARD
 * Preserves your original rounded-md design.
 * React.memo ensures that liking one post doesn't lag the other 999 posts.
 */
const PostCard = React.memo(
  ({ post, currentUser, onLike, onFollow, onShare, toggleFollowLoading }) => {
    const coverImageUrl = resolveMediaUrl(post.cover_image);
    const isOwnPost = currentUser?.id === post.author_id;

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="w-full"
      >
        <Card className="rounded-md border border-border overflow-hidden bg-card hover:shadow-md transition-shadow">
          {coverImageUrl && (
            <Link
              to={`/app/posts/${post.slug}`}
              className="block overflow-hidden"
            >
              <img
                src={coverImageUrl}
                alt={post.title}
                loading="lazy" // Performance: Only load images near the viewport
                className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
              />
            </Link>
          )}

          <div className="p-5 space-y-4">
            {/* Author Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link to={`/app/profile/${post.author_username}`}>
                  <Avatar className="h-9 w-9 border">
                    <AvatarImage src={post.author_avatar} />
                    <AvatarFallback>{post.author_name?.[0]}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="leading-tight">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/app/profile/${post.author_username}`}
                      className="font-bold text-sm hover:text-primary transition-colors"
                    >
                      {post.author_name}
                    </Link>
                    {!isOwnPost && (
                      <button
                        onClick={() => onFollow(post.author_id)}
                        disabled={toggleFollowLoading}
                        className={cn(
                          "text-xs font-bold transition-colors ml-2 disabled:opacity-50",
                          post.is_following_author
                            ? "text-muted-foreground"
                            : "text-emerald-600 hover:text-emerald-700",
                        )}
                      >
                        {post.is_following_author ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(post.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Post Body */}
            <div className="space-y-2">
              <Link to={`/app/posts/${post.slug}`}>
                <h3 className="font-bold text-xl md:text-2xl hover:text-primary transition-colors leading-tight">
                  {post.title}
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {post.markdown?.substring(0, 240)}...
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-5 text-xs font-bold">
                <button
                  onClick={() => onLike(post)}
                  className={cn(
                    "flex items-center gap-1.5 transition disabled:opacity-50",
                    post.is_liked
                      ? "text-red-500"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  <Heart
                    className={cn("h-4 w-4", post.is_liked && "fill-current")}
                  />
                  {post.likes_count || 0}
                </button>

                <Link
                  to={`/posts/${post.slug}#comments`}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-primary"
                >
                  <MessageSquare className="h-4 w-4" />
                  {post.comments_count || 0}
                </Link>

                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition">
                      <Share2 className="h-4 w-4" />
                      <span>{post.shares_count || 0}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={() => onShare(post, "copy")}>
                      <Copy className="mr-2 h-4 w-4" /> Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShare(post, "telegram")}>
                      <Send className="mr-2 h-4 w-4 text-blue-500" /> Telegram
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShare(post, "whatsapp")}>
                      <MessageCircle className="mr-2 h-4 w-4 text-green-500" />{" "}
                      WhatsApp
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link to={`/app/posts/${post.slug}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-2 text-xs font-bold uppercase tracking-wider"
                >
                  Read More <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  },
);

export default function ActivityFeed() {
  const { user: currentUser } = useAuth();
  const [sortBy, setSortBy] = useState("relevant");
  const { ref, inView } = useInView({ threshold: 0.1 });

  // 2. DATA SCALE: Using Infinite Query logic
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    usePosts({
      limit: 10,
      sortBy,
      userId: currentUser?.id,
    });

  const posts = useMemo(() => {
    if (!data) return [];
    return data.pages
      ? data.pages.flatMap((page) => page)
      : Array.isArray(data)
        ? data
        : [];
  }, [data]);

  // Trigger loading next page as user scrolls
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const toggleLikeMutation = useToggleLikePost();
  const toggleFollow = useToggleFollow();
  const shareMutation = useSharePost();

  /* --- Handlers --- */
  const handleToggleLike = (post) => {
    if (!currentUser) return toast.info("Please login to like posts");
    toggleLikeMutation.mutate({ id: post.id, isLiked: post.is_liked });
  };

  const handleShare = async (post, platform = "native") => {
    const shareUrl = `${window.location.origin}/posts/${post.slug}`;
    shareMutation.mutate(post.id);
    try {
      if (platform === "native" && navigator.share) {
        await navigator.share({ title: post.title, url: shareUrl });
        return;
      }
      if (platform === "copy") {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
        return;
      }
      const links = {
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
      };
      if (links[platform]) window.open(links[platform], "_blank");
    } catch (err) {
      if (err.name !== "AbortError") toast.error("Failed to share");
    }
  };

  return (
    <div className="space-y-6">
      {/* Original Tabs */}
      <div className="flex items-center gap-2 mb-4 border-b pb-1">
        {[
          { id: "relevant", label: "Relevant", icon: Zap },
          { id: "latest", label: "Latest", icon: Clock },
          { id: "top", label: "Top", icon: Flame },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSortBy(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative",
              sortBy === tab.id
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:bg-secondary/50",
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && posts.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUser={currentUser}
                onLike={handleToggleLike}
                onFollow={(id) => toggleFollow.mutate(id)}
                onShare={handleShare}
                toggleFollowLoading={toggleFollow.isLoading}
              />
            ))}
          </AnimatePresence>

          {/* INFINITE SCROLL SENTINEL */}
          <div ref={ref} className="h-10 flex items-center justify-center">
            {isFetchingNextPage && (
              <div className="text-sm text-muted-foreground animate-pulse">
                Loading more posts...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
