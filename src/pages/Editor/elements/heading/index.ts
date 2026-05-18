import type { ElementHandler } from "@src/pages/Editor/elements/base";

import { headingCatalog } from "./catalog";
import { createHeading } from "./create";
import { HeadingForm } from "./Form";
import { HeadingRenderer } from "./Renderer";
import { headingToHtml } from "./toHtml";
import type { HeadingElement } from "./types";

export type { HeadingElement } from "./types";

export const headingHandler: ElementHandler<HeadingElement> = {
  type: "heading",
  create: createHeading,
  catalog: headingCatalog,
  Renderer: HeadingRenderer,
  Form: HeadingForm,
  toHtml: headingToHtml,
};
