import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Reusable Markdown Renderer
 * Uses react-markdown for safe HTML rendering and remark-gfm for tables/checkboxes.
 * Using Tailwind Typography ('prose') for styling.
 */
export default function MarkdownRenderer({ content }) {
  return (
    <article
      className="prose prose-invert max-w-none 
      prose-headings:font-black prose-headings:tracking-tight prose-headings:text-foreground
      prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl
      prose-p:text-lg prose-p:leading-8 prose-p:text-foreground/90 
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-strong:text-foreground prose-strong:font-bold
      prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-muted/30 prose-pre:border-2 prose-pre:border-border/50 prose-pre:rounded-2xl prose-pre:text-foreground
      prose-img:rounded-3xl prose-img:shadow-lg prose-img:border prose-img:border-border/50
      prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:bg-muted/10 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
    "
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </article>
  );
}
