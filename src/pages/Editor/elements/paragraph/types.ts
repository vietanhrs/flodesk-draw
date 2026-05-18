import type { BaseElement } from "@src/pages/Editor/elements/base";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

export interface ParagraphElement extends BaseElement {
  type: "paragraph";
  text: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  align: TextAlign;
  lineHeight: number;
}
