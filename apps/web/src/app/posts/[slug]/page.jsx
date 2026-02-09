import { useParams, Link } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
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

  /* --- Loading/Error States --- */
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !post) return <ErrorState message={error?.message} />;

  return (
    <article className="max-w-3xl mx-auto py-12 px-6">
      {/* Header Navigation */}
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
              Edit Post
            </Button>
          </Link>
        )}
      </nav>

      {/* Article Header */}
      <header className="space-y-6 mb-10">
        <div className="flex flex-wrap gap-2">
          {post.tags?.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="rounded-full px-3 font-medium"
            >
              {tag}
            </Badge>
          ))}
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border shadow-sm">
              <AvatarImage
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`}
              />
              <AvatarFallback>{post.author_name?.[0] || "U"}</AvatarFallback>
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
              className={post.is_liked ? "text-red-500 hover:text-red-600" : ""}
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

      <Separator className="mb-10" />

      {/* Main Content */}
      <main className="prose prose-slate prose-lg max-w-none dark:prose-invert prose-headings:font-serif">
        <MarkdownRenderer content={post.markdown || ""} />
      </main>

      {/* Comments Section */}
      <footer className="mt-16 pt-8 border-t">
        <div className="flex items-center gap-2 mb-8">
          <MessageSquare className="h-5 w-5" />
          <h3 className="text-lg font-bold">
            Responses ({post.comments_count || 0})
          </h3>
        </div>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="group relative mb-12">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="What are your thoughts?"
              className="min-h-[120px] pr-12 focus-visible:ring-1 resize-none bg-muted/30 border-none shadow-inner"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute bottom-3 right-3 rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"
              disabled={commentMutation.isPending || !commentText.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="bg-muted/50 rounded-lg p-6 text-center mb-12">
            <p className="text-sm text-muted-foreground">
              <Link
                to="/auth/login"
                className="text-primary font-bold hover:underline"
              >
                Log in
              </Link>{" "}
              to join the conversation.
            </p>
          </div>
        )}

        <div className="space-y-8">
          {post.comments?.map((comment) => (
            <div key={comment.id} className="group flex gap-4">
              <Avatar className="h-9 w-9 border">
                <AvatarFallback>{comment.username?.[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-muted-foreground lowercase">
                    @{comment.username}
                  </span>
                  {user?.id === comment.user_id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() =>
                        deleteCommentMutation.mutate({
                          postId: post.id,
                          commentId: comment.id,
                        })
                      }
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="text-base leading-relaxed">{comment.text}</p>
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
    <div className="max-w-3xl mx-auto py-12 px-6 space-y-8 animate-pulse">
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-16 w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-12 w-32" />
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="max-w-md mx-auto my-20 text-center space-y-4">
      <h2 className="text-2xl font-bold font-serif">Post not found</h2>
      <p className="text-muted-foreground">
        {message || "We couldn't load the insight you're looking for."}
      </p>
      <Link to="/dashboard">
        <Button variant="outline">Return to Dashboard</Button>
      </Link>
    </div>
  );
}
