import { justifyOf } from "@src/pages/Editor/elements/shared/align";
import {
  escapeAttr,
  styleString,
} from "@src/pages/Editor/elements/shared/html";
import { safeLinkUrl } from "@src/pages/Editor/elements/shared/urls";

import { socialIcon, socialLabel } from "./labels";
import type { SocialElement } from "./types";

export const socialToHtml = (el: SocialElement): string => {
  const wrapper = styleString({
    display: "flex",
    "justify-content": justifyOf(el.align),
    gap: `${el.gap}px`,
  });
  const links = el.links
    .map((link) => {
      const a = styleString({
        display: "inline-flex",
        "align-items": "center",
        "justify-content": "center",
        width: `${el.size + 16}px`,
        height: `${el.size + 16}px`,
        "border-radius": "50%",
        border: `1px solid ${el.color}`,
        color: el.color,
        "font-size": `${el.size * 0.55}px`,
        "font-weight": 600,
        "text-decoration": "none",
        "font-family": "'Helvetica Neue', Arial, sans-serif",
      });
      return `<a href="${escapeAttr(safeLinkUrl(link.url))}" aria-label="${escapeAttr(socialLabel[link.platform])}" style="${a}">${socialIcon[link.platform]}</a>`;
    })
    .join("");
  return `<div style="${wrapper}">${links}</div>`;
};
