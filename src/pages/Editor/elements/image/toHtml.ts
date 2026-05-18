import { justifyOf } from "@src/pages/Editor/elements/shared/align";
import {
  escapeAttr,
  styleString,
} from "@src/pages/Editor/elements/shared/html";

import type { ImageElement } from "./types";

export const imageToHtml = (el: ImageElement): string => {
  const wrapper = styleString({
    display: "flex",
    "justify-content": justifyOf(el.align),
  });
  const img = styleString({
    width: `${el.widthPct}%`,
    height: "auto",
    display: "block",
    "border-radius": `${el.radius}px`,
    "object-fit": "cover",
  });
  return `<div style="${wrapper}"><img src="${escapeAttr(el.src)}" alt="${escapeAttr(el.alt)}" style="${img}" /></div>`;
};
