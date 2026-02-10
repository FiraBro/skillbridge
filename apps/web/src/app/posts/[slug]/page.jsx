import { useParams, Link } from "react-router-dom";
import { useState, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageSquare,
  Share2,
  Clock,
  ArrowLeft,
  Send,
  Trash2,
} from "lucide-react";

import {
  usePostDetail,
  useLikePost,
  useUnlikePost,
  useAddComment,
  useDeleteComment,
  useSharePost,
} from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import MarkdownRenderer from "@/components/markdown-renderer";
import { showToast } from "@/lib/toast";

export default function PostDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [commentText, setCommentText] = useState("");

  const { data: post, isLoading, isError, error } = usePostDetail(slug);

  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const commentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();
  const shareMutation = useSharePost();

  /* --- Handlers --- */
  const handleLike = useCallback(() => {
    if (!post) return;
    const mutation = post.is_liked ? unlikeMutation : likeMutation;
    mutation.mutate(post.id, {
      onError: () => showToast("Failed to update reaction"),
    });
  }, [post, likeMutation, unlikeMutation]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    shareMutation.mutate(post.id);
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title, url });
      } else {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard");
      }
    } catch {
      showToast("Unable to share this post");
    }
  }, [post, shareMutation]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    commentMutation.mutate(
      { id: post.id, text: commentText },
      {
        onSuccess: () => {
          setCommentText("");
          showToast("Comment posted");
        },
        onError: () => showToast("Failed to post comment"),
      },
    );
  };

  /* --- UI States --- */
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !post) return <ErrorState message={error?.message} />;

  return (
    <article className="max-w-3xl mx-auto py-12 px-6">
      {/* Navigation */}
      <nav className="flex items-center justify-between mb-12">
        <Link to="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="group text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to feed
          </Button>
        </Link>
        {user?.id === post.author_id && (
          <Link to={`/posts/${post.slug}/edit`}>
            <Button variant="outline" size="sm">
              Edit Insight
            </Button>
          </Link>
        )}
      </nav>

      {/* Main Post Content Area */}
      <div className="group/post -mx-4 px-4 py-8 rounded-2xl transition-all duration-300 hover:bg-slate-50/60 dark:hover:bg-white/5">
        <header className="space-y-6 mb-10">
          <div className="flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full px-3 font-medium border-none bg-slate-100 text-slate-600"
              >
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-tight text-slate-900 dark:text-slate-50">
            {post.title}
          </h1>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border shadow-sm">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`}
                />
                <AvatarFallback>{post.author_name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <Link
                  to={`/profile/${post.author_username}`}
                  className="text-sm font-semibold hover:underline block"
                >
                  {post.author_name}
                </Link>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`transition-colors ${post.is_liked ? "text-red-500 hover:text-red-600 hover:bg-red-50" : ""}`}
              >
                <Heart
                  className={`h-5 w-5 mr-1.5 ${post.is_liked ? "fill-current" : ""}`}
                />
                <span className="text-sm font-medium">{post.likes_count}</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="prose prose-slate prose-lg max-w-none dark:prose-invert prose-headings:font-serif">
          <MarkdownRenderer content={post.markdown || ""} />
        </main>
      </div>

      <Separator className="my-12" />

      {/* Responses Section */}
      <footer className="space-y-8">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-slate-400" />
          <h3 className="text-xl font-bold tracking-tight">
            Responses ({post.comments_count || 0})
          </h3>
        </div>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="group relative mb-12">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What are your thoughts?"
              className="min-h-[120px] p-4 rounded-xl border-none bg-slate-100/50 dark:bg-white/5 focus-visible:ring-1 focus-visible:bg-white dark:focus-visible:bg-slate-900 transition-all resize-none shadow-inner"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute bottom-3 right-3 rounded-full shadow-lg opacity-0 group-focus-within:opacity-100 transition-all transform group-focus-within:translate-y-0 translate-y-2"
              disabled={commentMutation.isPending || !commentText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-8 text-center border border-dashed border-slate-200">
            <p className="text-sm text-muted-foreground">
              <Link
                to="/auth/login"
                className="text-primary font-bold hover:underline"
              >
                Sign in
              </Link>{" "}
              to share your thoughts on this insight.
            </p>
          </div>
        )}

        {/* Comment List */}
        <div className="space-y-2">
          {post.comments?.map((comment) => (
            <div
              key={comment.id}
              className="group flex gap-4 p-5 rounded-2xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-100 dark:hover:border-white/10"
            >
              <Avatar className="h-9 w-9 border shadow-sm shrink-0">
                <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                  {comment.username?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    @{comment.username}
                  </span>
                  {user?.id === comment.user_id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() =>
                        deleteCommentMutation.mutate({
                          postId: post.id,
                          commentId: comment.id,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                  {comment.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </footer>
    </article>
  );
}

/* --- Helpers --- */

function LoadingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-8">
      <Skeleton className="h-10 w-32 rounded-lg" />
      <div className="space-y-4">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-3/4" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-32" />
      </div>
      <Skeleton className="h-80 w-full rounded-2xl" />
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="max-w-md mx-auto my-32 text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-3xl font-serif font-bold">Post unavailable</h2>
        <p className="text-muted-foreground">
          {message ||
            "The insight you are looking for has been moved or deleted."}
        </p>
      </div>
      <Link to="/dashboard">
        <Button variant="outline" className="rounded-full px-8">
          Return to feed
        </Button>
      </Link>
    </div>
  );
}
