import { useParams, Link } from "react-router-dom";
import {
  usePostDetail,
  useLikePost,
  useUnlikePost,
  useAddComment,
} from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Heart,
  MessageSquare,
  Share2,
  Clock,
  User,
  ArrowLeft,
  Send,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import MarkdownRenderer from "@/components/markdown-renderer";

export default function PostDetailPage() {
  const { slug } = useParams();
  const { user: currentUser } = useAuth();
  const { data: post, isLoading } = usePostDetail(slug);
  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const commentMutation = useAddComment();

  const [commentText, setCommentText] = useState("");

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 py-8 animate-pulse">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-12 w-3/4 rounded-xl" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <h1 className="text-2xl font-black uppercase italic opacity-20 tracking-tighter">
          Insight Not Found
        </h1>
        <Link to="/dashboard">
          <Button variant="ghost" className="gap-2 font-bold uppercase text-xs">
            <ArrowLeft className="h-4 w-4" /> Back to Feed
          </Button>
        </Link>
      </div>
    );
  }

  const handleLike = () => {
    if (post.is_liked) {
      unlikeMutation.mutate(post.id);
    } else {
      likeMutation.mutate(post.id);
    }
  };

  const handleComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    commentMutation.mutate(
      { id: post.id, text: commentText },
      {
        onSuccess: () => setCommentText(""),
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <Link to="/dashboard">
        <Button
          variant="ghost"
          className="gap-2 font-bold uppercase text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Intelligence Feed
        </Button>
      </Link>

      <article className="space-y-8">
        <header className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {post.tags?.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-black px-3"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
            <h1 className="text-5xl font-black tracking-tight leading-none italic uppercase">
              {post.title}
            </h1>
          </div>

          <div className="flex items-center justify-between py-6 border-y border-border/50">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border">
                <User className="h-6 w-6" />
              </div>
              <div>
                <Link
                  to={`/profile/${post.author_username}`}
                  className="font-bold hover:text-primary transition-colors"
                >
                  {post.author_name}
                </Link>
                <p className="text-[10px] font-bold uppercase text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={post.is_liked ? "default" : "outline"}
                className={`gap-2 rounded-xl px-6 font-bold transition-all ${post.is_liked ? "shadow-lg shadow-primary/20" : ""}`}
                onClick={handleLike}
              >
                <Heart
                  className={`h-4 w-4 ${post.is_liked ? "fill-current" : ""}`}
                />
                {post.likes_count || 0}
              </Button>
              <Button
                variant="outline"
                className="gap-2 rounded-xl px-6 font-bold"
              >
                <Share2 className="h-4 w-4" />
                Broadcast
              </Button>
            </div>
          </div>
        </header>

        <div className="w-full">
          <MarkdownRenderer content={post.markdown || ""} />
        </div>
      </article>

      <section className="space-y-8 pt-10 border-t">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h3 className="text-2xl font-black uppercase italic tracking-tight">
            Intelligence Log ({post.comments_count || 0})
          </h3>
        </div>

        {currentUser ? (
          <form onSubmit={handleComment} className="relative group">
            <textarea
              placeholder="Inject insight into this node..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full min-h-[120px] bg-muted/30 border-2 border-border/50 rounded-2xl p-6 text-sm font-medium focus:outline-none focus:border-primary/50 transition-all resize-none pr-16"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute bottom-6 right-6 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
              disabled={!commentText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Card className="p-8 text-center bg-muted/10 border-dashed border-2 rounded-2xl">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
              Please{" "}
              <Link to="/auth/login" className="text-primary hover:underline">
                authenticate
              </Link>{" "}
              to contribute to the discussion.
            </p>
          </Card>
        )}

        <div className="space-y-6">
          {post.comments?.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <div className="h-10 w-10 rounded-xl bg-muted/50 border flex items-center justify-center text-muted-foreground shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm tracking-tight">
                      {comment.username}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 italic">
                      {formatDistanceToNow(new Date(comment.created_at), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  {currentUser?.id === comment.user_id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <p className="text-sm font-medium text-foreground/80 leading-relaxed bg-muted/15 p-4 rounded-xl border border-transparent group-hover:border-border/30 transition-all">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
          {(!post.comments || post.comments.length === 0) && (
            <p className="text-center py-10 text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-30">
              No transmissions received yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
