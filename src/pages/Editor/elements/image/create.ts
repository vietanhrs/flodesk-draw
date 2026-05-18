import { createId } from "@src/pages/Editor/utils/ids";

import type { ImageElement } from "./types";

export const createImage = (): ImageElement => ({
  id: createId("el"),
  type: "image",
  src: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1200",
  alt: "Placeholder image",
  widthPct: 100,
  align: "center",
  radius: 0,
});
