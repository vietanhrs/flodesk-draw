import { createId } from "@src/pages/Editor/utils/ids";

import type { PageRow } from "../types";

export const row = (
  config: Partial<PageRow> & Pick<PageRow, "columns">
): PageRow => ({
  id: createId("row"),
  backgroundColor: "transparent",
  paddingX: 64,
  paddingY: 40,
  marginY: 0,
  columnsCount: 1,
  columnWidths: [1],
  columnGap: 24,
  ...config,
});
