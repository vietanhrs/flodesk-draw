import type { SpacerElement } from "./types";

export const spacerToHtml = (el: SpacerElement): string =>
  `<div aria-hidden="true" style="height:${el.height}px;width:100%"></div>`;
