import { useState } from "react"; // Added useState
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
  Zap, // Icon for Relevant
  Flame, // Icon for Top
  Calendar, // Icon for Latest
} from "lucide-react";
import { usePosts, useToggleLikePost, useSharePost } from "@/hooks/usePosts";
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
  // 1. Manage the current filter state
  const [sortBy, setSortBy] = useState("relevant");

  // 2. Pass sortBy to your hook (Backend listPosts uses this)
  const { data: posts, isLoading } = usePosts({ limit: 10, sortBy });
  console.log("post:", posts);

  const toggleLike = useToggleLikePost();
  const { mutate: recordShareInDb } = useSharePost();

  const handleShare = async (post, platform = "native") => {
    const shareUrl = `${window.location.origin}/posts/${post.slug}`;
    const shareTitle = post.title;
    recordShareInDb(post.id);

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

      let targetUrl = "";
      if (platform === "telegram") {
        const tg = new URL("https://t.me");
        tg.searchParams.set("url", shareUrl);
        tg.searchParams.set("text", shareTitle);
        targetUrl = tg.toString();
      } else if (platform === "whatsapp") {
        const wa = new URL("https://wa.me");
        wa.searchParams.set("text", `${shareTitle} ${shareUrl}`);
        targetUrl = wa.toString();
      } else if (platform === "linkedin") {
        const li = new URL("https://www.linkedin.com");
        li.searchParams.set("url", shareUrl);
        targetUrl = li.toString();
      }

      if (targetUrl) window.open(targetUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      if (err.name !== "AbortError") toast.error("Failed to share");
    }
  };

  return (
    <div className="space-y-6">
      {/* ================= TABS NAVIGATION (Dev.to Style) ================= */}
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
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={sortBy} // Animates whenever the tab changes
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {posts?.map((post, index) => {
              const coverImageUrl = resolveMediaUrl(post.cover_image);
              const hasImage = Boolean(coverImageUrl);

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="rounded-none border-none hover:shadow-md transition overflow-hidden bg-card">
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

                    <div
                      className={cn(
                        "p-5",
                        hasImage
                          ? "space-y-4"
                          : "flex flex-col md:flex-row gap-4",
                      )}
                    >
                      {/* USER INFO */}
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
                            <AvatarFallback>
                              {post.author_name?.[0]}
                            </AvatarFallback>
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
                        </div>
                      </div>

                      {/* CONTENT */}
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

                        {/* ACTIONS */}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-4 text-xs font-bold">
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
                              className="flex items-center gap-1 text-muted-foreground hover:text-primary"
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              {post.comments_count || 0}
                            </Link>

                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition">
                                  <Share2 className="h-3.5 w-3.5" />
                                  <span>{post.shares_count || 0}</span>
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                align="start"
                                className="w-48"
                              >
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
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
