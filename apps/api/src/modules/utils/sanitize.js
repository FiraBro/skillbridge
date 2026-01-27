import sanitizeHtmlLib from "sanitize-html";
import { marked } from "marked";

// For posts
export function sanitizeMarkdown(markdown) {
  const rawHtml = marked.parse(markdown);

  return sanitizeHtmlLib(rawHtml, {
    allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      a: ["href", "target"],
      img: ["src", "alt"],
    },
    allowedSchemes: ["http", "https", "mailto"], // optional safety
  });
}

// For comments or plain text
export function sanitizeHtml(text) {
  return sanitizeHtmlLib(text, {
    allowedTags: [],
    allowedAttributes: {},
  });
}
