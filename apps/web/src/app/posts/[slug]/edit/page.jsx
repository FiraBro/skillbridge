import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { usePostDetail, useUpdatePost } from "@/hooks/usePosts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-toastify"; // Note: The original file used toast from components/ui/use-toast or react-toastify?
// Original CreatePostPage used "@/components/ui/use-toast", but DetailPage used "react-toastify".
// I'll stick to one. Let's check imports in DetailPage... it uses "react-toastify". CreatePage uses "@/components/ui/use-toast".
// I'll use "react-toastify" here for consistency with DetailPage or follow CreatePage style?
// Provide checking DetailPage again... Step 11 shows `import { toast } from "react-toastify";`.
// I'll use "react-toastify".

import {
  ArrowLeft,
  Sparkles,
  Terminal,
  Hash,
  Eye,
  ChevronRight,
} from "lucide-react";
import MarkdownRenderer from "@/components/markdown-renderer";
import { useAuth } from "@/hooks/useAuth";

export default function EditPostPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: post, isLoading: isPostLoading } = usePostDetail(slug);
  const updateMutation = useUpdatePost();

  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (post) {
      if (user && post.author_id !== user.id) {
        toast.error("You cannot edit this post");
        navigate("/dashboard");
        return;
      }
      setTitle(post.title || "");
      setMarkdown(post.markdown || "");
      setTags(post.tags || []);
    }
  }, [post, user, navigate]);

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !markdown.trim()) return;

    updateMutation.mutate(
      { id: post.id, data: { title, markdown, tags } },
      {
        onSuccess: () => {
          toast.success("Post updated successfully");
          navigate(`/posts/${slug}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update post");
        },
      },
    );
  };

  if (isPostLoading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <Link to={`/posts/${slug}`}>
          <Button
            variant="ghost"
            className="gap-2 font-bold uppercase text-[10px] tracking-widest text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel Edit
          </Button>
        </Link>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 border border-primary/20 rounded-full">
          <Sparkles className="h-3 w-3 text-primary animate-pulse" />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">
            System Update
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-5xl font-black tracking-tight leading-none italic uppercase">
          Update <span className="text-primary">Insight</span>
        </h1>
        <p className="text-muted-foreground font-medium italic">
          Refine your findings and maintain data integrity.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-8 space-y-8 bg-card/50 backdrop-blur-sm border-2 border-border/50 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                Core Objective
              </label>
              <Input
                placeholder="Name your transmission..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-16 text-2xl font-black tracking-tight bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 placeholder:opacity-20 uppercase italic"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Detailed Payload
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold text-muted-foreground/40 italic uppercase tracking-widest flex items-center gap-1">
                    <Terminal className="h-3 w-3" /> Markdown Supported
                  </span>
                  <div className="flex bg-muted/30 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setIsPreview(false)}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${!isPreview ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Editor
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPreview(true)}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${isPreview ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      Preview
                    </button>
                  </div>
                </div>
              </div>

              {isPreview ? (
                <div className="w-full min-h-[400px] bg-muted/10 rounded-2xl p-6 border border-border/50 overflow-auto resize-y">
                  <MarkdownRenderer
                    content={markdown || "*No content to preview*"}
                  />
                </div>
              ) : (
                <textarea
                  placeholder="Document your evidence, methodology, and results... Use # for headers, ** for bold."
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full min-h-[400px] bg-transparent border-none focus:outline-none text-lg leading-relaxed font-medium placeholder:italic placeholder:opacity-20 resize-y pt-4"
                />
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6 space-y-6 rounded-3xl border border-border/50 bg-card/30">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Hash className="h-4 w-4" />
                <h3 className="font-bold text-sm uppercase italic">
                  Categorization
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-4 bg-muted/20 rounded-2xl border border-border/30">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    className="bg-primary text-primary-foreground font-black uppercase text-[9px] gap-1 px-2.5"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}{" "}
                    <span className="hover:text-white cursor-pointer opacity-50">
                      ×
                    </span>
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <span className="text-[10px] font-bold text-muted-foreground/30 uppercase italic">
                    No tags assigned
                  </span>
                )}
              </div>
              <Input
                placeholder="Add tag and press Enter..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                className="h-10 text-xs font-bold bg-muted/30 border-none rounded-xl"
              />
            </div>

            <div className="pt-6 border-t border-border/50 space-y-4">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase text-muted-foreground italic">
                <span>Visibility</span>
                <span className="text-green-500 flex items-center gap-1">
                  <Eye className="h-3 w-3" /> Public
                </span>
              </div>
              <Button
                type="submit"
                className="w-full h-14 rounded-2xl gap-3 font-black uppercase italic shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all group"
                disabled={
                  updateMutation.isPending || !title.trim() || !markdown.trim()
                }
              >
                {updateMutation.isPending ? (
                  "Updating..."
                ) : (
                  <>
                    Update Broadcast
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
