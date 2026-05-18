import { createId } from "@src/pages/Editor/utils/ids";

import type { SpacerElement } from "./types";

export const createSpacer = (): SpacerElement => ({
  id: createId("el"),
  type: "spacer",
  height: 32,
});
