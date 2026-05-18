import type { ElementHandler } from "@src/pages/Editor/elements/base";

import { videoCatalog } from "./catalog";
import { createVideo } from "./create";
import { VideoForm } from "./Form";
import { VideoRenderer } from "./Renderer";
import { videoToHtml } from "./toHtml";
import type { VideoElement } from "./types";

export type { VideoElement } from "./types";

export const videoHandler: ElementHandler<VideoElement> = {
  type: "video",
  create: createVideo,
  catalog: videoCatalog,
  Renderer: VideoRenderer,
  Form: VideoForm,
  toHtml: videoToHtml,
};
