import type { BaseElement } from "@src/pages/Editor/elements/base";

export interface SpacerElement extends BaseElement {
  type: "spacer";
  height: number;
}
