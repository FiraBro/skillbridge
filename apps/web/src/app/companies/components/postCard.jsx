import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Clock, ArrowRight, Heart, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToggleLikePost } from "@/hooks/usePosts";

export default function PostCard({
  post,
  index = 0,
  canDelete = false,
  onDelete,
}) {
  const toggleLike = useToggleLikePost();
  console.log("post:", post);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="relative p-4 hover:shadow-md transition-all rounded-xl border border-border/50 bg-card group/card">
        {/* DELETE BUTTON */}
        {canDelete && (
          <button
            onClick={onDelete}
            className="absolute top-3 right-3 text-muted-foreground hover:text-red-500 transition-colors"
            title="Delete post"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}

        <div className="flex gap-4">
          {/* LEFT — Avatar Section */}
          <div className="shrink-0 flex flex-col items-center">
            <Link to={`/profile/${post.author_username}`}>
              <Avatar className="h-10 w-10 border border-border/50">
                <AvatarImage src={post.author_avatar} />
                <AvatarFallback className="text-xs">
                  {post.author_name?.[0]}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>

          {/* RIGHT — Content Section */}
          <div className="flex-1 min-w-0">
            {/* Author Meta */}
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={`/profile/${post.author_username}`}
                className="text-xs font-bold hover:text-primary transition-colors truncate"
              >
                {post.author_name}
              </Link>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <span className="opacity-30">•</span>
                <Clock className="h-2.5 w-2.5" />
                {formatDistanceToNow(new Date(post.created_at), {
                  addSuffix: true,
                })}
              </span>
            </div>

            {/* Title */}
            <Link to={`/posts/${post.slug}`}>
              <h3 className="text-base sm:text-lg font-bold tracking-tight hover:text-primary transition-colors leading-tight mb-2">
                {post.title}
              </h3>
            </Link>

            {/* Snippet */}
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
              {post.markdown?.substring(0, 160)}...
            </p>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    toggleLike.mutate({ id: post.id, isLiked: post.is_liked })
                  }
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold transition-colors",
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
                  className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  {post.comments_count || 0}
                </Link>
              </div>

              <Link to={`/posts/${post.slug}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[11px] font-bold uppercase group"
                >
                  Read More
                  <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
