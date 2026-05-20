import type { PageElement } from "@src/pages/Editor/elements";
import { createId } from "@src/pages/Editor/utils/ids";

import type { DragSource, DropTarget } from "./DragContext";
import {
  cloneRow,
  evenWidths,
  insertAt,
  move,
  newEmptyColumns,
  replaceRow,
} from "./pageOperations";
import type { PageData, PageRow } from "./types";

export const createEmptyRow = (): PageRow => ({
  id: createId("row"),
  backgroundColor: "transparent",
  paddingX: 64,
  paddingY: 40,
  marginY: 0,
  columnsCount: 1,
  columnWidths: [1],
  columnGap: 24,
  columns: newEmptyColumns(1),
});

export const setRowColumnsCountOnPage = (
  page: PageData,
  rowId: string,
  count: 1 | 2 | 3 | 4
): PageData =>
  replaceRow(page, rowId, (row) => {
    if (row.columnsCount === count) return row;
    const columns = [...row.columns];
    if (count > columns.length) {
      while (columns.length < count) columns.push([]);
    } else {
      const overflow = columns.slice(count).flat();
      columns.length = count;
      if (overflow.length > 0) {
        columns[count - 1] = [...columns[count - 1], ...overflow];
      }
    }
    return {
      ...row,
      columnsCount: count,
      columnWidths: evenWidths(count),
      columns,
    };
  });

export const setColumnWidthOnPage = (
  page: PageData,
  rowId: string,
  index: number,
  width: number
): PageData =>
  replaceRow(page, rowId, (row) => {
    const widths = [...row.columnWidths];
    widths[index] = Math.max(0.1, width);
    return { ...row, columnWidths: widths };
  });

export const addRowToPage = (
  page: PageData,
  index: number
): { page: PageData; row: PageRow } => {
  const row = createEmptyRow();
  return { page: { ...page, rows: insertAt(page.rows, row, index) }, row };
};

export const moveRowOnPage = (
  page: PageData,
  fromIndex: number,
  toIndex: number
): PageData => ({ ...page, rows: move(page.rows, fromIndex, toIndex) });

export const duplicateRowOnPage = (
  page: PageData,
  rowId: string
): { page: PageData; row: PageRow } | null => {
  const index = page.rows.findIndex((r) => r.id === rowId);
  if (index < 0) return null;
  const row = cloneRow(page.rows[index]);
  return { page: { ...page, rows: insertAt(page.rows, row, index + 1) }, row };
};

export const addElementToPage = (
  page: PageData,
  rowId: string,
  columnIndex: number,
  element: PageElement,
  insertIndex?: number
): PageData =>
  replaceRow(page, rowId, (row) => ({
    ...row,
    columns: row.columns.map((col, i) =>
      i === columnIndex
        ? insertAt(col, element, insertIndex ?? col.length)
        : col
    ),
  }));

export const addElementRowToPage = (
  page: PageData,
  element: PageElement
): { page: PageData; row: PageRow } => {
  const row: PageRow = { ...createEmptyRow(), columns: [[element]] };
  return { page: { ...page, rows: [...page.rows, row] }, row };
};

export const duplicateElementOnPage = (
  page: PageData,
  rowId: string,
  columnIndex: number,
  elementId: string
): { page: PageData; element: PageElement } | null => {
  const row = page.rows.find((r) => r.id === rowId);
  const col = row?.columns[columnIndex];
  if (!col) return null;
  const elIdx = col.findIndex((el) => el.id === elementId);
  if (elIdx < 0) return null;
  const element = { ...col[elIdx], id: createId("el") };
  const next = replaceRow(page, rowId, (r) => ({
    ...r,
    columns: r.columns.map((c, i) =>
      i === columnIndex ? insertAt(c, element, elIdx + 1) : c
    ),
  }));
  return { page: next, element };
};

export const deleteElementFromPage = (
  page: PageData,
  rowId: string,
  elementId: string
): PageData =>
  replaceRow(page, rowId, (row) => ({
    ...row,
    columns: row.columns.map((col) => col.filter((el) => el.id !== elementId)),
  }));

export const moveElementOnPage = (
  page: PageData,
  source: DragSource,
  target: DropTarget
): { page: PageData; element: PageElement } | null => {
  const srcRow = page.rows.find((r) => r.id === source.rowId);
  const srcCol = srcRow?.columns[source.columnIndex];
  if (!srcCol) return null;
  const srcElIdx = srcCol.findIndex((el) => el.id === source.elementId);
  if (srcElIdx < 0) return null;
  const element = srcCol[srcElIdx];

  const isSameColumn =
    source.rowId === target.rowId && source.columnIndex === target.columnIndex;

  let adjustedInsert = target.insertIndex;
  if (isSameColumn && adjustedInsert > srcElIdx) adjustedInsert -= 1;
  if (isSameColumn && adjustedInsert === srcElIdx) return null;

  const rows = page.rows.map((row) => {
    if (row.id !== source.rowId && row.id !== target.rowId) return row;
    const columns = row.columns.map((col, idx) => {
      let next = col;
      if (
        row.id === source.rowId &&
        idx === source.columnIndex &&
        !(isSameColumn && idx === target.columnIndex)
      ) {
        next = next.filter((el) => el.id !== source.elementId);
      }
      if (
        row.id === source.rowId &&
        isSameColumn &&
        idx === source.columnIndex
      ) {
        const without = next.filter((el) => el.id !== source.elementId);
        return insertAt(without, element, adjustedInsert);
      }
      if (
        row.id === target.rowId &&
        idx === target.columnIndex &&
        !isSameColumn
      ) {
        return insertAt(next, element, adjustedInsert);
      }
      return next;
    });
    return { ...row, columns };
  });

  return { page: { ...page, rows }, element };
};
