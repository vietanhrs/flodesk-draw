import { justifyOf } from "@src/pages/Editor/elements/shared/align";
import {
  escapeAttr,
  escapeHtml,
  styleString,
} from "@src/pages/Editor/elements/shared/html";
import { safeLinkUrl } from "@src/pages/Editor/elements/shared/urls";

import type { ButtonElement } from "./types";

export const buttonToHtml = (el: ButtonElement): string => {
  const wrapper = styleString({
    display: "flex",
    "justify-content": justifyOf(el.align),
  });
  const hasBorder =
    el.backgroundColor === "transparent" ||
    el.backgroundColor === "rgba(0,0,0,0)";
  const btn = styleString({
    display: "inline-block",
    "background-color": el.backgroundColor,
    color: el.textColor,
    padding: `${el.paddingY}px ${el.paddingX}px`,
    "border-radius": `${el.radius}px`,
    "font-size": `${el.fontSize}px`,
    "font-weight": 600,
    "letter-spacing": `${el.letterSpacing}px`,
    "text-transform": "uppercase",
    "text-decoration": "none",
    border: hasBorder ? `1px solid ${el.textColor}` : "none",
    "font-family": "'Helvetica Neue', Arial, sans-serif",
  });
  return `<div style="${wrapper}"><a href="${escapeAttr(safeLinkUrl(el.href))}" style="${btn}">${escapeHtml(el.label)}</a></div>`;
};
