import type { BaseElement } from "@src/pages/Editor/elements/base";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

export interface HeadingElement extends BaseElement {
  type: "heading";
  text: string;
  level: 1 | 2 | 3;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  align: TextAlign;
  letterSpacing: number;
}
