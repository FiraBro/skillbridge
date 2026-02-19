import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Clock, ArrowRight, Heart, Eye } from "lucide-react";
import { usePosts, useToggleLikePost } from "@/hooks/usePosts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { resolveMediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export default function ActivityFeed() {
  const { data: posts, isLoading } = usePosts({ limit: 5 });
  const toggleLike = useToggleLikePost();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 w-full rounded-none" />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="p-12 text-center rounded-none border-none opacity-50">
        <p className="text-sm font-bold uppercase tracking-widest">
          No platform activity detected
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {posts.map((post, index) => {
          const coverImageUrl = resolveMediaUrl(post.cover_image);
          const hasImage = Boolean(coverImageUrl);

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Card className="rounded-none border-none hover:shadow-md transition overflow-hidden">
                {/* ================= IMAGE (ONLY IF EXISTS) ================= */}
                {hasImage && (
                  <Link to={`/posts/${post.slug}`}>
                    <img
                      src={coverImageUrl}
                      alt={post.title}
                      className="w-full h-56 object-cover"
                      loading="lazy"
                    />
                  </Link>
                )}

                {/* ================= CONTENT ================= */}
                <div
                  className={cn(
                    "p-5",
                    hasImage
                      ? "space-y-4" // vertical dev.to style
                      : "flex flex-col md:flex-row gap-4", // side-by-side
                  )}
                >
                  {/* ===== PROFILE / META ===== */}
                  <div
                    className={cn(
                      "flex gap-3",
                      hasImage
                        ? "items-center text-sm"
                        : "md:w-40 shrink-0 md:block",
                    )}
                  >
                    <Link to={`/profile/${post.author_username}`}>
                      <Avatar
                        className={cn(hasImage ? "h-8 w-8" : "h-11 w-11")}
                      >
                        <AvatarImage src={post.author_avatar} />
                        <AvatarFallback>{post.author_name?.[0]}</AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="leading-tight">
                      <Link
                        to={`/profile/${post.author_username}`}
                        className="font-bold hover:text-primary"
                      >
                        {post.author_name}
                      </Link>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </div>

                      {!hasImage && post.tags?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[9px] uppercase font-bold"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ===== MAIN CONTENT ===== */}
                  <div className={cn(hasImage ? "" : "flex-1 space-y-4")}>
                    <Link to={`/posts/${post.slug}`}>
                      <h3
                        className={cn(
                          "font-bold hover:text-primary transition-colors",
                          hasImage ? "text-lg" : "text-base sm:text-lg",
                        )}
                      >
                        {post.title}
                      </h3>
                    </Link>

                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {post.markdown?.substring(0, 240)}...
                    </p>

                    {/* ===== ACTIONS ===== */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {post.views || 0}
                        </span>

                        <button
                          onClick={() =>
                            toggleLike.mutate({
                              id: post.id,
                              isLiked: post.is_liked,
                            })
                          }
                          className={cn(
                            "flex items-center gap-1 transition",
                            post.is_liked
                              ? "text-red-500"
                              : "text-muted-foreground hover:text-primary",
                          )}
                        >
                          <Heart
                            className={cn(
                              "h-3.5 w-3.5",
                              post.is_liked && "fill-current",
                            )}
                          />
                          {post.likes_count || 0}
                        </button>

                        <Link
                          to={`/posts/${post.slug}#comments`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {post.comments_count || 0}
                        </Link>
                      </div>

                      <Link to={`/posts/${post.slug}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-2 text-xs uppercase"
                        >
                          Read <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
