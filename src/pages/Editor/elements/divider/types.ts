import type { BaseElement } from "@src/pages/Editor/elements/base";

export interface DividerElement extends BaseElement {
  type: "divider";
  color: string;
  thickness: number;
  widthPct: number;
}
