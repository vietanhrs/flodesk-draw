import { createId } from "@src/pages/Editor/utils/ids";

import type { DividerElement } from "./types";

export const createDivider = (): DividerElement => ({
  id: createId("el"),
  type: "divider",
  color: "#d8d2c5",
  thickness: 1,
  widthPct: 100,
});
