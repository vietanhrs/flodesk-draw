import type { ElementType } from "@src/pages/Editor/state/types";

const TYPE_NEW_ELEMENT = "application/x-flodesk-draw-element";
const TYPE_ROW_MOVE = "application/x-flodesk-draw-row";

export const setNewElementDrag = (dt: DataTransfer, type: ElementType) => {
  dt.effectAllowed = "copy";
  dt.setData(TYPE_NEW_ELEMENT, type);
  dt.setData("text/plain", type);
};

export const readNewElementDrag = (dt: DataTransfer): ElementType | null => {
  const value = dt.getData(TYPE_NEW_ELEMENT);
  return value ? (value as ElementType) : null;
};

export const setRowDrag = (dt: DataTransfer, rowId: string) => {
  dt.effectAllowed = "move";
  dt.setData(TYPE_ROW_MOVE, rowId);
};

export const readRowDrag = (dt: DataTransfer): string | null => {
  const v = dt.getData(TYPE_ROW_MOVE);
  return v || null;
};

export const dragHasNewElement = (dt: DataTransfer): boolean =>
  dt.types.includes(TYPE_NEW_ELEMENT);

export const dragHasRow = (dt: DataTransfer): boolean =>
  dt.types.includes(TYPE_ROW_MOVE);
