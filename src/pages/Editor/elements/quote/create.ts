import { createId } from "@src/pages/Editor/utils/ids";

import type { QuoteElement } from "./types";

export const createQuote = (): QuoteElement => ({
  id: createId("el"),
  type: "quote",
  text: "A short, memorable quote goes right here.",
  author: "— Source",
  color: "#2a241f",
  fontSize: 24,
  fontFamily: "Georgia, 'Times New Roman', serif",
  align: "center",
});
