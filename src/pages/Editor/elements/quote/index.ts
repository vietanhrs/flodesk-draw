import type { ElementHandler } from "@src/pages/Editor/elements/base";

import { quoteCatalog } from "./catalog";
import { createQuote } from "./create";
import { QuoteForm } from "./Form";
import { QuoteRenderer } from "./Renderer";
import { quoteToHtml } from "./toHtml";
import type { QuoteElement } from "./types";
import { validateQuote } from "./validate";

export type { QuoteElement } from "./types";

export const quoteHandler: ElementHandler<QuoteElement> = {
  type: "quote",
  create: createQuote,
  catalog: quoteCatalog,
  Renderer: QuoteRenderer,
  Form: QuoteForm,
  toHtml: quoteToHtml,
  validate: validateQuote,
};
