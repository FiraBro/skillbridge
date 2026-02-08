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
    if (selectedFile) formData.append("coverImage", selectedFile);

    mutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 font-sans text-zinc-900 overflow-x-hidden">
      {/* --- RESPONSIVE HEADER --- */}
      <header className="h-14 px-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-sm z-50">
        <div className="flex items-center gap-2 md:gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-zinc-100 rounded-md transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <span className="font-bold text-sm md:text-base tracking-tight">
            {isPreview ? "Previewing Post" : "Create Post"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreview(!isPreview)}
            className={`text-sm font-medium ${isPreview ? "text-[#108a00] bg-[#108a00]/5" : ""}`}
          >
            {isPreview ? "Edit" : "Preview"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={mutation.isPending || !title.trim() || !markdown.trim()}
            className="bg-[#108a00] hover:bg-[#0d7300] text-white px-4 h-9 rounded-md font-bold text-sm"
          >
            {mutation.isPending ? "Publishing..." : "Publish"}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <div className="space-y-6 md:space-y-8">
          {/* --- COVER IMAGE (RESPONSIVE) --- */}
          {!isPreview && (
            <div className="flex items-center gap-4">
              {!imagePreview ? (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-zinc-200 dark:border-zinc-800 rounded-md text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                  >
                    <ImageIcon className="h-4 w-4" />
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
                <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
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
                    className="absolute top-4 right-4 bg-zinc-900/80 hover:bg-red-600 p-1.5 rounded-full text-white transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* --- CONTENT AREA --- */}
          <div className="space-y-6">
            {isPreview ? (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    className="w-full aspect-[21/9] object-cover rounded-xl mb-8"
                    alt="Preview Cover"
                  />
                )}
                <h1 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
                  {title || "Untitled Transmission"}
                </h1>
                <div className="flex flex-wrap gap-3 mb-8">
                  {tags.map((t) => (
                    <span key={t} className="text-[#108a00] font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <MarkdownRenderer
                    content={markdown || "_No content content yet..._"}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* AUTO-RESIZING TITLE */}
                <textarea
                  ref={titleRef}
                  rows="1"
                  placeholder="New post title here..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-3xl md:text-5xl font-black placeholder:text-zinc-300 dark:placeholder:text-zinc-700 border-none focus:ring-0 resize-none bg-transparent p-0 overflow-hidden leading-tight"
                />

                {/* TAGS INPUT */}
                <div className="flex flex-wrap items-center gap-3">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-md text-sm font-medium text-zinc-600 dark:text-zinc-400 group"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
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
                      className="border-none focus:ring-0 bg-transparent text-sm md:text-base p-0 w-32 placeholder:text-zinc-400"
                    />
                  )}
                </div>

                {/* MAIN CONTENT AREA */}
                <textarea
                  placeholder="Write your content here..."
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  className="w-full min-h-[40vh] text-base md:text-xl border-none focus:ring-0 bg-transparent resize-none font-sans placeholder:text-zinc-300 dark:placeholder:text-zinc-700 leading-relaxed p-0"
                />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- DESKTOP HINTS SIDEBAR --- */}
      <aside className="hidden xl:block fixed top-32 right-8 w-64 space-y-6">
        <div className="p-4 border border-zinc-100 dark:border-zinc-800 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-[#108a00]">
            <Info className="h-4 w-4" />
            <h4 className="font-bold text-xs uppercase tracking-widest">
              Writing Tips
            </h4>
          </div>
          <ul className="text-xs text-zinc-500 space-y-3 leading-relaxed">
            <li>
              • Use <b># Header</b> for main sections.
            </li>
            <li>
              • Use <b>[Link Name](URL)</b> for hyperlinks.
            </li>
            <li>• Add up to 4 tags to reach the right audience.</li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
