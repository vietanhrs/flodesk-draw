import type { ElementType } from "@src/pages/Editor/elements";

const TYPE_NEW_ELEMENT = "application/x-flodesk-draw-element";
const TYPE_ROW_MOVE = "application/x-flodesk-draw-row";
const TYPE_ELEMENT_MOVE = "application/x-flodesk-draw-element-move";

export interface ElementMovePayload {
  rowId: string;
  columnIndex: number;
  elementId: string;
}

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

export const setElementMoveDrag = (
  dt: DataTransfer,
  payload: ElementMovePayload
) => {
  dt.effectAllowed = "move";
  dt.setData(TYPE_ELEMENT_MOVE, JSON.stringify(payload));
};

export const readElementMoveDrag = (
  dt: DataTransfer
): ElementMovePayload | null => {
  const raw = dt.getData(TYPE_ELEMENT_MOVE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ElementMovePayload;
  } catch {
    return null;
  }
};

export const dragHasNewElement = (dt: DataTransfer): boolean =>
  dt.types.includes(TYPE_NEW_ELEMENT);

export const dragHasRow = (dt: DataTransfer): boolean =>
  dt.types.includes(TYPE_ROW_MOVE);

export const dragHasElementMove = (dt: DataTransfer): boolean =>
  dt.types.includes(TYPE_ELEMENT_MOVE);

export const dragHasAnyElement = (dt: DataTransfer): boolean =>
  dragHasNewElement(dt) || dragHasElementMove(dt);
