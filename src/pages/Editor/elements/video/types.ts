import type { BaseElement } from "@src/pages/Editor/elements/base";

export interface VideoElement extends BaseElement {
  type: "video";
  url: string;
  widthPct: number;
}
