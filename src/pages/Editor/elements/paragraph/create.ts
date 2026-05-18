import { createId } from "@src/pages/Editor/utils/ids";

import type { ParagraphElement } from "./types";

export const createParagraph = (): ParagraphElement => ({
  id: createId("el"),
  type: "paragraph",
  text: "Write something thoughtful. Click to edit this paragraph.",
  color: "#3a3a3a",
  fontSize: 16,
  fontWeight: 400,
  fontFamily: "'Helvetica Neue', Arial, sans-serif",
  align: "left",
  lineHeight: 1.7,
});
