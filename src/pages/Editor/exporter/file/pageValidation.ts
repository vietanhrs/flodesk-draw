import { validateElement } from "@src/pages/Editor/elements/validation";
import type { PageData } from "@src/pages/Editor/state/types";

import {
  failInvalidPage,
  isRecord,
  isUnknownArray,
  MAX_ELEMENTS,
  MAX_ELEMENTS_PER_COLUMN,
  MAX_ID_LENGTH,
  MAX_ROWS,
  MAX_TITLE_LENGTH,
  requireArray,
  requireColor,
  requireColumnsCount,
  requireNumberInRange,
  requireString,
} from "./validationPrimitives";

const validateColumnWidths = (
  row: Record<string, unknown>,
  rowPath: string,
  columnsCount: 1 | 2 | 3 | 4
) => {
  const columnWidths = row.columnWidths;
  if (!isUnknownArray(columnWidths)) {
    return failInvalidPage(`${rowPath}.columnWidths`, "an array");
  }
  if (columnWidths.length !== columnsCount) {
    failInvalidPage(
      `${rowPath}.columnWidths`,
      `an array with ${String(columnsCount)} entries`
    );
  }
  columnWidths.forEach((width, widthIndex) =>
    requireNumberInRange(
      width,
      `${rowPath}.columnWidths[${widthIndex}]`,
      0.1,
      10
    )
  );
};

export const validatePage = (value: unknown): PageData => {
  if (!isRecord(value)) return failInvalidPage("page", "an object");
  const page = value;
  requireString(page.title, "page.title", MAX_TITLE_LENGTH);
  requireColor(page.backgroundColor, "page.backgroundColor", {
    allowTransparent: true,
  });
  requireNumberInRange(page.paddingX, "page.paddingX", 0, 200);
  requireNumberInRange(page.paddingY, "page.paddingY", 0, 200);
  const rows = requireArray(page.rows, "page.rows", MAX_ROWS);
  let totalElements = 0;

  rows.forEach((rowValue, rowIndex) => {
    const rowPath = `page.rows[${rowIndex}]`;
    if (!isRecord(rowValue)) return failInvalidPage(rowPath, "an object");
    const row = rowValue;
    requireString(row.id, `${rowPath}.id`, MAX_ID_LENGTH);
    requireColor(row.backgroundColor, `${rowPath}.backgroundColor`, {
      allowTransparent: true,
    });
    requireNumberInRange(row.paddingX, `${rowPath}.paddingX`, 0, 200);
    requireNumberInRange(row.paddingY, `${rowPath}.paddingY`, 0, 200);
    requireNumberInRange(row.marginY, `${rowPath}.marginY`, 0, 200);
    const columnsCount = requireColumnsCount(
      row.columnsCount,
      `${rowPath}.columnsCount`
    );
    requireNumberInRange(row.columnGap, `${rowPath}.columnGap`, 0, 200);
    validateColumnWidths(row, rowPath, columnsCount);

    const columns = row.columns;
    if (!isUnknownArray(columns)) {
      return failInvalidPage(`${rowPath}.columns`, "an array");
    }
    if (columns.length !== columnsCount) {
      failInvalidPage(
        `${rowPath}.columns`,
        `an array with ${String(columnsCount)} entries`
      );
    }
    columns.forEach((column, columnIndex) => {
      const columnPath = `${rowPath}.columns[${columnIndex}]`;
      if (!isUnknownArray(column))
        return failInvalidPage(columnPath, "an array");
      if (column.length > MAX_ELEMENTS_PER_COLUMN) {
        failInvalidPage(
          columnPath,
          `an array with at most ${MAX_ELEMENTS_PER_COLUMN} entries`
        );
      }
      totalElements += column.length;
      if (totalElements > MAX_ELEMENTS) {
        failInvalidPage("page.rows", `at most ${MAX_ELEMENTS} total elements`);
      }
      column.forEach((element, elementIndex) =>
        validateElement(element, `${columnPath}[${elementIndex}]`)
      );
    });
  });

  return page as unknown as PageData;
};
