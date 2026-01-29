import { useParams, Link } from "react-router-dom";
import { useState, useCallback, useMemo } from "react";
import { formatDistanceToNow } from "date-fns";
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

import {
  usePostDetail,
  useLikePost,
  useUnlikePost,
  useAddComment,
  useDeleteComment,
} from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MarkdownRenderer from "@/components/markdown-renderer";
import { toast } from "react-toastify";

export default function PostDetailPage() {
  const { slug } = useParams();
  const { user } = useAuth();

  const { data: post, isLoading, isError, error } = usePostDetail(slug);

  const likeMutation = useLikePost();
  const unlikeMutation = useUnlikePost();
  const commentMutation = useAddComment();
  const deleteCommentMutation = useDeleteComment();

  const [commentText, setCommentText] = useState("");

  /* ----------------------- handlers ----------------------- */

  const handleLike = useCallback(() => {
    if (!post) return;

    const mutation = post.is_liked ? unlikeMutation : likeMutation;

    mutation.mutate(post.id, {
      onError: () => {
        toast.error("Failed to update reaction");
      },
    });
  }, [post, likeMutation, unlikeMutation]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      toast.error("Unable to share this post");
    }
  }, [post]);

  const handleCommentSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (!commentText.trim()) return;

      commentMutation.mutate(
        { id: post.id, text: commentText },
        {
          onSuccess: () => {
            setCommentText("");
            toast.success("Comment posted");
          },
          onError: () => {
            toast.error("Failed to post comment");
          },
        },
      );
    },
    [commentText, post, commentMutation],
  );

  const handleDeleteComment = useCallback(
    (commentId) => {
      if (!confirm("Delete this comment?")) return;

      deleteCommentMutation.mutate(commentId, {
        onError: () => toast.error("Failed to delete comment"),
      });
    },
    [deleteCommentMutation],
  );

  /* ----------------------- derived data ----------------------- */

  const renderedMarkdown = useMemo(
    () => <MarkdownRenderer content={post?.markdown || ""} />,
    [post?.markdown],
  );

  /* ----------------------- states ----------------------- */

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-6 animate-pulse">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full rounded-3xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="max-w-2xl mx-auto p-10 text-center">
        <p className="text-lg font-bold text-red-500">Failed to load post</p>
        <p className="text-sm text-muted-foreground mt-2">
          {error?.message || "Something went wrong"}
        </p>
        <Link to="/dashboard">
          <Button variant="ghost" className="mt-6">
            Go back
          </Button>
        </Link>
      </Card>
    );
  }

  if (!post) return null;

  /* ----------------------- UI ----------------------- */

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10">
      <Link to="/dashboard">
        <Button variant="ghost" className="gap-2 text-xs font-bold uppercase">
          <ArrowLeft className="h-4 w-4" />
          Back to Feed
        </Button>
      </Link>

      <article className="space-y-8">
        {/* Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {post.tags?.map((tag) => (
              <Badge key={tag} variant="secondary">
                #{tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-4xl font-black tracking-tight">{post.title}</h1>

          <div className="flex justify-between items-center border-y py-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <User />
              </div>
              <div>
                <Link
                  to={`/profile/${post.author_username}`}
                  className="font-bold hover:underline"
                >
                  {post.author_name}
                </Link>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleLike}
                disabled={likeMutation.isPending || unlikeMutation.isPending}
                variant={post.is_liked ? "default" : "outline"}
                aria-label="Like post"
              >
                <Heart className={post.is_liked ? "fill-current" : ""} />
                {post.likes_count}
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                aria-label="Share post"
              >
                <Share2 />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        {renderedMarkdown}
      </article>

      {/* Comments */}
      <section className="space-y-8 pt-10 border-t">
        <div className="flex items-center gap-3">
          <MessageSquare />
          <h3 className="text-xl font-black">
            Comments ({post.comments_count || 0})
          </h3>
        </div>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="relative">
            <label htmlFor="comment" className="sr-only">
              Add comment
            </label>
            <textarea
              id="comment"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your thoughts…"
              className="w-full min-h-[120px] rounded-xl p-4 border resize-none"
            />
            <Button
              type="submit"
              size="icon"
              disabled={commentMutation.isPending}
              className="absolute bottom-4 right-4"
            >
              <Send />
            </Button>
          </form>
        ) : (
          <Card className="p-6 text-center">
            <Link to="/auth/login" className="text-primary font-bold">
              Login to comment
            </Link>
          </Card>
        )}

        <div className="space-y-6">
          {post.comments?.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="h-10 w-10 bg-muted rounded-xl flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-bold text-sm">{comment.username}</span>
                  {user?.id === comment.user_id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteComment(comment.id)}
                      aria-label="Delete comment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
