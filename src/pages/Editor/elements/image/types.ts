import type { BaseElement } from "@src/pages/Editor/elements/base";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt: string;
  widthPct: number;
  align: TextAlign;
  radius: number;
}
