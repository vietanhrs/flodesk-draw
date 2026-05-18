import {
  escapeHtml,
  styleString,
} from "@src/pages/Editor/elements/shared/html";

import type { QuoteElement } from "./types";

export const quoteToHtml = (el: QuoteElement): string => {
  const style = styleString({
    margin: 0,
    "font-style": "italic",
    color: el.color,
    "font-size": `${el.fontSize}px`,
    "font-family": el.fontFamily,
    "text-align": el.align,
  });
  const citeStyle = styleString({
    display: "block",
    "margin-top": "12px",
    "font-style": "normal",
    "font-size": `${Math.max(11, el.fontSize * 0.4)}px`,
    "letter-spacing": "2px",
    "text-transform": "uppercase",
    opacity: 0.7,
  });
  const cite = el.author
    ? `<cite style="${citeStyle}">${escapeHtml(el.author)}</cite>`
    : "";
  return `<blockquote style="${style}"><div>${escapeHtml(el.text)}</div>${cite}</blockquote>`;
};
