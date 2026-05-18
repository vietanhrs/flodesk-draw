import type { ElementHandler } from "@src/pages/Editor/elements/base";

import { imageCatalog } from "./catalog";
import { createImage } from "./create";
import { ImageForm } from "./Form";
import { ImageRenderer } from "./Renderer";
import { imageToHtml } from "./toHtml";
import type { ImageElement } from "./types";

export type { ImageElement } from "./types";

export const imageHandler: ElementHandler<ImageElement> = {
  type: "image",
  create: createImage,
  catalog: imageCatalog,
  Renderer: ImageRenderer,
  Form: ImageForm,
  toHtml: imageToHtml,
};
