import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  MessageSquare,
  Clock,
  ArrowRight,
  Heart,
  Share2,
  Send,
  MessageCircle,
  Linkedin,
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

export default function ActivityFeed() {
  const { user: currentUser } = useAuth();
  const [sortBy, setSortBy] = useState("relevant");

  /**
   * FIX: Added userId to the hook parameters.
   * This ensures the backend can calculate 'is_following_author'
   * specifically for the logged-in user.
   */
  const { data: postsData, isLoading } = usePosts({
    limit: 10,
    sortBy,
    userId: currentUser?.id,
  });

  const posts = Array.isArray(postsData) ? postsData : postsData?.data || [];

  const toggleLike = useToggleLikePost();
  const toggleFollow = useToggleFollow();
  const shareMutation = useSharePost();

  const handleShare = async (post, platform = "native") => {
    const shareUrl = `${window.location.origin}/posts/${post.slug}`;
    const shareTitle = post.title;

    shareMutation.mutate(post.id);

    try {
      if (platform === "native" && navigator.share) {
        await navigator.share({
          title: shareTitle,
          text: shareTitle,
          url: shareUrl,
        });
        return;
      }
      if (platform === "copy") {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied!");
        return;
      }

      const shareLinks = {
        telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(shareTitle + " " + shareUrl)}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      };

      if (shareLinks[platform]) {
        window.open(shareLinks[platform], "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      if (err.name !== "AbortError") toast.error("Failed to share");
    }
  };

  return (
    <div className="space-y-6">
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

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={sortBy}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6"
          >
            {posts.map((post, index) => {
              const coverImageUrl = resolveMediaUrl(post.cover_image);
              const isOwnPost = currentUser?.id === post.author_id;

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="rounded-md border border-border overflow-hidden bg-card hover:shadow-md transition-shadow">
                    {coverImageUrl && (
                      <Link
                        to={`/posts/${post.slug}`}
                        className="block overflow-hidden"
                      >
                        <img
                          src={coverImageUrl}
                          alt={post.title}
                          className="w-full h-56 object-cover hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                    )}

                    <div className="p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Link to={`/profile/${post.author_username}`}>
                            <Avatar className="h-9 w-9 border">
                              <AvatarImage src={post.author_avatar} />
                              <AvatarFallback>
                                {post.author_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="leading-tight">
                            <div className="flex items-center gap-2">
                              <Link
                                to={`/profile/${post.author_username}`}
                                className="font-bold text-sm hover:text-primary transition-colors"
                              >
                                {post.author_name}
                              </Link>

                              {!isOwnPost && (
                                <>
                                  <span className="text-muted-foreground text-[10px]">
                                    •
                                  </span>
                                  <button
                                    onClick={() =>
                                      toggleFollow.mutate(post.author_id)
                                    }
                                    disabled={toggleFollow.isLoading}
                                    className={cn(
                                      "text-xs font-bold transition-colors disabled:opacity-50",
                                      post.is_following_author
                                        ? "text-muted-foreground"
                                        : "text-emerald-600 hover:text-emerald-700",
                                    )}
                                  >
                                    {post.is_following_author
                                      ? "Following"
                                      : "Follow"}
                                  </button>
                                </>
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

                      <div className="space-y-2">
                        <Link to={`/posts/${post.slug}`}>
                          <h3 className="font-bold text-xl md:text-2xl hover:text-primary transition-colors leading-tight">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                          {post.markdown?.substring(0, 240)}...
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-5 text-xs font-bold">
                          <button
                            onClick={() =>
                              toggleLike.mutate({
                                id: post.id,
                                isLiked: post.is_liked,
                              })
                            }
                            className={cn(
                              "flex items-center gap-1.5 transition",
                              post.is_liked
                                ? "text-red-500"
                                : "text-muted-foreground hover:text-primary",
                            )}
                          >
                            <Heart
                              className={cn(
                                "h-4 w-4",
                                post.is_liked && "fill-current",
                              )}
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
                              <DropdownMenuItem
                                onClick={() => handleShare(post, "copy")}
                              >
                                <Copy className="mr-2 h-4 w-4" /> Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleShare(post, "telegram")}
                              >
                                <Send className="mr-2 h-4 w-4 text-blue-500" />{" "}
                                Telegram
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleShare(post, "whatsapp")}
                              >
                                <MessageCircle className="mr-2 h-4 w-4 text-green-500" />{" "}
                                WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleShare(post, "linkedin")}
                              >
                                <Linkedin className="mr-2 h-4 w-4 text-blue-700" />{" "}
                                LinkedIn
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <Link to={`/posts/${post.slug}`}>
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
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
