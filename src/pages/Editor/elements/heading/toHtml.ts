import {
  escapeHtml,
  styleString,
} from "@src/pages/Editor/elements/shared/html";

import type { HeadingElement } from "./types";

export const headingToHtml = (el: HeadingElement): string => {
  const style = styleString({
    margin: 0,
    color: el.color,
    "font-size": `${el.fontSize}px`,
    "font-weight": el.fontWeight,
    "font-family": el.fontFamily,
    "letter-spacing": `${el.letterSpacing}px`,
    "line-height": 1.1,
    "text-align": el.align,
  });
  return `<h${el.level} style="${style}">${escapeHtml(el.text)}</h${el.level}>`;
};
