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
import { cn } from "@/lib/utils";

export default function ActivityFeed() {
  const { data: posts, isLoading } = usePosts({ limit: 5 });
  const toggleLike = useToggleLikePost();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-none w-full" />
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
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
          >
            <Card className="p-5 hover:shadow-md transition-all rounded-none border-none">
              {/* RESPONSIVE CONTAINER */}
              <div className="flex flex-col md:flex-row gap-4 md:gap-4">
                {/* LEFT — Avatar + Meta */}
                <div className="w-full md:w-40 shrink-0 flex md:block gap-3">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={post.author_avatar} />
                    <AvatarFallback>{post.author_name?.[0]}</AvatarFallback>
                  </Avatar>

                  <div className="space-y-1 text-xs">
                    <Link
                      to={`/profile/${post.author_username}`}
                      className="font-bold hover:text-primary transition-colors block"
                    >
                      {post.author_name}
                    </Link>

                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(post.created_at), {
                        addSuffix: true,
                      })}
                    </span>

                    {post.tags?.length > 0 && (
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

                {/* RIGHT — Content */}
                <div className="flex-1 min-w-0 space-y-4">
                  <Link to={`/posts/${post.slug}`}>
                    <h3 className="text-base sm:text-lg font-bold tracking-tight hover:text-primary transition-colors break-words">
                      {post.title}
                    </h3>
                  </Link>

                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 break-words">
                    {post.markdown?.substring(0, 240)}...
                  </p>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                        <Eye className="h-3.5 w-3.5" />
                        {post.views || 0}
                      </span>

                      <button
                        disabled={toggleLike.isPending}
                        onClick={(e) => {
                          e.preventDefault();
                          toggleLike.mutate({
                            id: post.id,
                            isLiked: post.is_liked,
                          });
                        }}
                        className={cn(
                          "flex items-center gap-1 text-xs font-bold transition-all",
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
                        className="flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-primary"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        {post.comments_count || 0}
                      </Link>
                    </div>

                    <Link to={`/posts/${post.slug}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-2 text-xs font-bold uppercase"
                      >
                        Read <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
