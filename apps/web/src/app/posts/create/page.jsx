import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postService } from "@/services";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import {
  Image as ImageIcon,
  X,
  Info,
  ChevronLeft,
  MoreVertical,
} from "lucide-react";

import MarkdownRenderer from "@/components/markdown-renderer";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const titleRef = useRef(null);

  const [title, setTitle] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [isPreview, setIsPreview] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Auto-resize title textarea as user types
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "auto";
      titleRef.current.style.height = titleRef.current.scrollHeight + "px";
    }
  }, [title]);

  const mutation = useMutation({
    mutationFn: (formData) => postService.create(formData),
    onSuccess: (post) => {
      queryClient.invalidateQueries(["posts"]);
      toast({ title: "Post published!" });
      navigate(`/posts/${post.slug}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      if (newTag && !tags.includes(newTag) && tags.length < 4) {
        setTags([...tags, newTag]);
      }
      setTagInput("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !markdown.trim()) return;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("markdown", markdown);
    formData.append("tags", JSON.stringify(tags));
    if (selectedFile) formData.append("cover_image", selectedFile);

    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 dark:text-zinc-100 overflow-x-hidden">
      {/* --- RESPONSIVE STICKY HEADER --- */}
      <header className="h-14 md:h-16 px-4 md:px-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-md transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="font-bold text-sm md:text-lg tracking-tight truncate max-w-[120px] sm:max-w-none">
            {isPreview ? "Previewing" : "Create Post"}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 md:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className={`text-xs md:text-sm font-semibold h-9 px-3 md:px-4 ${
              isPreview ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : ""
            }`}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending || !title.trim() || !markdown.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 h-9 rounded-md font-bold text-xs md:text-sm transition-all active:scale-95"
          >
            {mutation.isPending ? "..." : "Publish"}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden h-9 w-9">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 md:py-12">
        <div className="space-y-6 md:space-y-10">
          {/* --- COVER IMAGE UPLOADER --- */}
          {!isPreview && (
            <div className="w-full">
              {!imagePreview ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-2 px-4 py-3 md:py-4 w-full justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-zinc-500 hover:border-blue-500 hover:text-blue-500 transition-all"
                  >
                    <ImageIcon className="h-5 w-5" />
                    Add a cover image
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </>
              ) : (
                <div className="relative group w-full aspect-[21/9] rounded-xl overflow-hidden shadow-sm border border-zinc-200 dark:border-zinc-800">
                  <img
                    src={imagePreview}
                    className="w-full h-full object-cover"
                    alt="Cover"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-3 right-3 md:top-4 md:right-4 bg-zinc-900/90 hover:bg-red-600 p-2 rounded-full text-white shadow-lg transition-all active:scale-90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --- EDITOR / PREVIEW --- */}
          <div className="min-h-[60vh]">
            {isPreview ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="w-full aspect-[21/9] object-cover rounded-xl mb-6 md:mb-10 shadow-sm"
                    alt="Preview Cover"
                  />
                )}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black mb-4 md:mb-6 leading-[1.1] tracking-tight">
                  {title || "Untitled Transmission"}
                </h1>
                <div className="flex flex-wrap gap-2 md:gap-3 mb-8 md:mb-12">
                  {tags.map((t) => (
                    <span
                      key={t}
                      className="text-blue-600 dark:text-blue-400 font-bold text-sm md:text-base"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="prose prose-zinc dark:prose-invert max-w-none prose-img:rounded-xl">
                  <MarkdownRenderer
                    content={
                      markdown || "_No content added yet. Start writing..._"
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
                <textarea
                  ref={titleRef}
                  rows="1"
                  placeholder="New post title here..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-3xl md:text-5xl lg:text-6xl font-black placeholder:text-zinc-300 dark:placeholder:text-zinc-800 border-none focus:ring-0 resize-none bg-transparent p-0 overflow-hidden leading-[1.1] tracking-tight"
                />

                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-md text-xs md:text-sm font-bold text-zinc-600 dark:text-zinc-400 group border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-all"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                        aria-label="Remove tag"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  {tags.length < 4 && (
                    <input
                      placeholder="Add tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      className="border-none focus:ring-0 bg-transparent text-sm md:text-base p-1 w-28 md:w-40 placeholder:text-zinc-400"
                    />
                  )}
                </div>

                <textarea
                  placeholder="Write your content here..."
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full min-h-[40vh] md:min-h-[50vh] text-base md:text-xl border-none focus:ring-0 bg-transparent resize-none font-sans placeholder:text-zinc-200 dark:placeholder:text-zinc-800 leading-relaxed p-0"
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- DESKTOP HINTS (HIDDEN ON MOBILE/TABLET) --- */}
      <aside className="hidden xl:block fixed top-32 right-6 2xl:right-12 w-64 space-y-6">
        <div className="p-5 border border-zinc-100 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-blue-600">
            <Info className="h-4 w-4" />
            <h4 className="font-bold text-[10px] uppercase tracking-[0.2em]">
              Writing Tips
            </h4>
          </div>
          <ul className="text-xs text-zinc-500 dark:text-zinc-400 space-y-3 leading-relaxed">
            <li>
              • Use <b># Header</b> for main sections.
            </li>
            <li>
              • Use <b>[Link](URL)</b> for hyperlinks.
            </li>
            <li>• Markdown is fully supported for code and lists.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
