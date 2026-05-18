import type { ElementHandler } from "@src/pages/Editor/elements/base";

import { buttonCatalog } from "./catalog";
import { createButton } from "./create";
import { ButtonForm } from "./Form";
import { ButtonRenderer } from "./Renderer";
import { buttonToHtml } from "./toHtml";
import type { ButtonElement } from "./types";

export type { ButtonElement } from "./types";

export const buttonHandler: ElementHandler<ButtonElement> = {
  type: "button",
  create: createButton,
  catalog: buttonCatalog,
  Renderer: ButtonRenderer,
  Form: ButtonForm,
  toHtml: buttonToHtml,
};
