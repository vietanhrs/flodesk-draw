import type { ElementHandler } from "@src/pages/Editor/elements/base";

import { spacerCatalog } from "./catalog";
import { createSpacer } from "./create";
import { SpacerForm } from "./Form";
import { SpacerRenderer } from "./Renderer";
import { spacerToHtml } from "./toHtml";
import type { SpacerElement } from "./types";
import { validateSpacer } from "./validate";

export type { SpacerElement } from "./types";

export const spacerHandler: ElementHandler<SpacerElement> = {
  type: "spacer",
  create: createSpacer,
  catalog: spacerCatalog,
  Renderer: SpacerRenderer,
  Form: SpacerForm,
  toHtml: spacerToHtml,
  validate: validateSpacer,
};
