import type { ElementHandler } from "@src/pages/Editor/elements/base";

import { paragraphCatalog } from "./catalog";
import { createParagraph } from "./create";
import { ParagraphForm } from "./Form";
import { ParagraphRenderer } from "./Renderer";
import { paragraphToHtml } from "./toHtml";
import type { ParagraphElement } from "./types";
import { validateParagraph } from "./validate";

export type { ParagraphElement } from "./types";

export const paragraphHandler: ElementHandler<ParagraphElement> = {
  type: "paragraph",
  create: createParagraph,
  catalog: paragraphCatalog,
  Renderer: ParagraphRenderer,
  Form: ParagraphForm,
  toHtml: paragraphToHtml,
  validate: validateParagraph,
};
