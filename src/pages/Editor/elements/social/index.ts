import type { ElementHandler } from "@src/pages/Editor/elements/base";

import { socialCatalog } from "./catalog";
import { createSocial } from "./create";
import { SocialForm } from "./Form";
import { SocialRenderer } from "./Renderer";
import { socialToHtml } from "./toHtml";
import type { SocialElement } from "./types";

export type { SocialElement, SocialLink } from "./types";

export const socialHandler: ElementHandler<SocialElement> = {
  type: "social",
  create: createSocial,
  catalog: socialCatalog,
  Renderer: SocialRenderer,
  Form: SocialForm,
  toHtml: socialToHtml,
};
