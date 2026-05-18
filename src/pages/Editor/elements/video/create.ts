import { createId } from "@src/pages/Editor/utils/ids";

import type { VideoElement } from "./types";

export const createVideo = (): VideoElement => ({
  id: createId("el"),
  type: "video",
  url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  widthPct: 100,
});
