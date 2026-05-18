import type { ElementHandler } from "@src/pages/Editor/elements/base";

import { dividerCatalog } from "./catalog";
import { createDivider } from "./create";
import { DividerForm } from "./Form";
import { DividerRenderer } from "./Renderer";
import { dividerToHtml } from "./toHtml";
import type { DividerElement } from "./types";

export type { DividerElement } from "./types";

export const dividerHandler: ElementHandler<DividerElement> = {
  type: "divider",
  create: createDivider,
  catalog: dividerCatalog,
  Renderer: DividerRenderer,
  Form: DividerForm,
  toHtml: dividerToHtml,
};
