import type { PageElement } from "@src/pages/Editor/elements";

export interface PageRow {
  id: string;
  backgroundColor: string;
  paddingX: number;
  paddingY: number;
  marginY: number;
  columnsCount: 1 | 2 | 3 | 4;
  columnWidths: number[];
  columnGap: number;
  columns: PageElement[][];
}

export interface PageData {
  title: string;
  backgroundColor: string;
  paddingX: number;
  paddingY: number;
  rows: PageRow[];
}

export interface ElementSelection {
  rowId: string;
  columnIndex: number;
  elementId: string;
}

export interface RowSelection {
  rowId: string;
}

export type Selection =
  | ({ kind: "row" } & RowSelection)
  | ({ kind: "element" } & ElementSelection)
  | null;

export type Viewport = "desktop" | "mobile";
