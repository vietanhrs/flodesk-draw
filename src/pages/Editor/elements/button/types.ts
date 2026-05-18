import type { BaseElement } from "@src/pages/Editor/elements/base";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

export interface ButtonElement extends BaseElement {
  type: "button";
  label: string;
  href: string;
  backgroundColor: string;
  textColor: string;
  paddingX: number;
  paddingY: number;
  radius: number;
  fontSize: number;
  align: TextAlign;
  letterSpacing: number;
}
