import {
  escapeAttr,
  styleString,
} from "@src/pages/Editor/elements/shared/html";
import {
  safeVideoUrl,
  VIDEO_IFRAME_SANDBOX,
} from "@src/pages/Editor/elements/shared/urls";

import type { VideoElement } from "./types";

export const videoToHtml = (el: VideoElement): string => {
  const wrapper = styleString({
    width: `${el.widthPct}%`,
    margin: "0 auto",
    position: "relative",
    "padding-bottom": `${(9 / 16) * el.widthPct}%`,
  });
  const iframe = styleString({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: 0,
  });
  return `<div style="${wrapper}"><iframe src="${escapeAttr(safeVideoUrl(el.url))}" title="Embedded video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy" sandbox="${VIDEO_IFRAME_SANDBOX}" style="${iframe}"></iframe></div>`;
};
