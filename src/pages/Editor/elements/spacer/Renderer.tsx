import type { SpacerElement } from "./types";

export const SpacerRenderer = ({ element }: { element: SpacerElement }) => (
  <div aria-hidden="true" style={{ height: element.height, width: "100%" }} />
);
