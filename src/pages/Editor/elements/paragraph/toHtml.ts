import {
  escapeHtml,
  styleString,
} from "@src/pages/Editor/elements/shared/html";

import type { ParagraphElement } from "./types";

export const paragraphToHtml = (el: ParagraphElement): string => {
  const style = styleString({
    margin: 0,
    color: el.color,
    "font-size": `${el.fontSize}px`,
    "font-weight": el.fontWeight,
    "font-family": el.fontFamily,
    "line-height": el.lineHeight,
    "white-space": "pre-wrap",
    "text-align": el.align,
  });
  return `<p style="${style}">${escapeHtml(el.text)}</p>`;
};
