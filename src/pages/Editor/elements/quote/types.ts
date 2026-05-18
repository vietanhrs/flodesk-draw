import type { BaseElement } from "@src/pages/Editor/elements/base";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

export interface QuoteElement extends BaseElement {
  type: "quote";
  text: string;
  author: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  align: TextAlign;
}
