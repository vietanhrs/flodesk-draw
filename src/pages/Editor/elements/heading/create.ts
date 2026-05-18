import { createId } from "@src/pages/Editor/utils/ids";

import type { HeadingElement } from "./types";

export const createHeading = (): HeadingElement => ({
  id: createId("el"),
  type: "heading",
  text: "Headline text",
  level: 2,
  color: "#1f1f1f",
  fontSize: 36,
  fontWeight: 600,
  fontFamily: "Georgia, 'Times New Roman', serif",
  align: "left",
  letterSpacing: 0,
});
