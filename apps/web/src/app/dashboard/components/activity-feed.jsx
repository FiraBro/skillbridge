import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Clock, ArrowRight, Heart, Eye } from "lucide-react";

import { usePosts, useLikePost, useUnlikePost } from "@/hooks/usePosts";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ActivityFeed() {
  const { data: posts, isLoading } = usePosts({ limit: 5 });
  const likePost = useLikePost();
  const unlikePost = useUnlikePost();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-3xl w-full" />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Card className="p-12 border-dashed border-2 text-center rounded-3xl opacity-50">
        <p className="text-sm font-bold uppercase tracking-widest">
          No platform activity detected.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="p-6 rounded-2xl bg-card border-border/50 hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Link to={`/posts/${post.slug}`}>
                      <h4 className="font-bold text-lg tracking-tight hover:text-primary transition-colors">
                        {post.title}
                      </h4>
                    </Link>

                    <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-muted-foreground italic">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                        })}
                      </span>

                      <Link
                        to={`/profile/${post.author_username}`}
                        className="hover:text-primary transition-colors hover:not-italic"
                      >
                        By {post.author_name}
                      </Link>
                    </div>
                  </div>

                  {post.tags?.length > 0 && (
                    <div className="flex gap-1">
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-[9px] font-black uppercase px-2 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Preview */}
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {post.markdown?.substring(0, 150)}...
                </p>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      {post.views || 0}
                    </span>

                    {/* LIKE (working) */}
                    <button
                      onClick={() =>
                        post.is_liked
                          ? unlikePost.mutate(post.id)
                          : likePost.mutate(post.id)
                      }
                      disabled={likePost.isPending || unlikePost.isPending}
                      className="flex items-center gap-1.5 text-xs font-bold transition-colors"
                    >
                      <Heart
                        className={cn(
                          "h-3.5 w-3.5 transition-colors",
                          post.is_liked
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground hover:text-primary",
                        )}
                      />
                      {post.likes_count || 0}
                    </button>

                    {/* COMMENTS */}
                    <Link
                      to={`/posts/${post.slug}#comments`}
                      className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.comments_count || 0}
                    </Link>
                  </div>

                  <Link to={`/posts/${post.slug}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 font-bold text-xs uppercase"
                    >
                      Inspect <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
