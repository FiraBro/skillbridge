import sanitizeHtmlLib from "sanitize-html";
import { marked } from "marked";

// For posts
export function sanitizeMarkdown(markdown) {
  const rawHtml = marked.parse(markdown);

  return sanitizeHtmlLib(rawHtml, {
    allowedTags: sanitizeHtmlLib.defaults.allowedTags.concat([
      "img",
      "h1",
      "h2",
      "span",
      "u",
    ]),
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
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
