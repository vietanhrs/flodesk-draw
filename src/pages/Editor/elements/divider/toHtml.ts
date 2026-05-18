import { styleString } from "@src/pages/Editor/elements/shared/html";

import type { DividerElement } from "./types";

export const dividerToHtml = (el: DividerElement): string => {
  const margin = el.widthPct >= 100 ? "0" : `0 ${(100 - el.widthPct) / 2}%`;
  const style = styleString({
    border: 0,
    height: `${el.thickness}px`,
    "background-color": el.color,
    margin,
    width: `${el.widthPct}%`,
  });
  return `<hr style="${style}" />`;
};
