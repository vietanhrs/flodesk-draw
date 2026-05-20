import type { PageElement } from "@src/pages/Editor/elements";
import { createId } from "@src/pages/Editor/utils/ids";

import type { PageData, PageRow } from "./types";

export const cloneRow = (r: PageRow): PageRow => ({
  ...r,
  id: createId("row"),
  columnWidths: [...r.columnWidths],
  columns: r.columns.map((col) =>
    col.map((el) => ({ ...el, id: createId("el") }))
  ),
});

export const replaceRow = (
  page: PageData,
  rowId: string,
  patch: (row: PageRow) => PageRow
): PageData => ({
  ...page,
  rows: page.rows.map((r) => (r.id === rowId ? patch(r) : r)),
});

export const replaceElement = (
  page: PageData,
  rowId: string,
  elementId: string,
  patch: (el: PageElement) => PageElement
): PageData =>
  replaceRow(page, rowId, (row) => ({
    ...row,
    columns: row.columns.map((col) =>
      col.map((el) => (el.id === elementId ? patch(el) : el))
    ),
  }));

export const newEmptyColumns = (count: number): PageElement[][] =>
  Array.from({ length: count }, () => []);

export const evenWidths = (count: number): number[] =>
  Array.from({ length: count }, () => 1);

export const insertAt = <T>(arr: T[], item: T, index: number): T[] => [
  ...arr.slice(0, index),
  item,
  ...arr.slice(index),
];

export const move = <T>(arr: T[], from: number, to: number): T[] => {
  if (from === to || from < 0 || from >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};
