import { useCallback } from "react";

import { CanvasRow } from "./CanvasRow";
import { useEditor } from "../../state/EditorContext";
import {
  dragHasNewElement,
  readNewElementDrag,
} from "../../utils/dragData";

const VIEWPORT_WIDTH: Record<"desktop" | "mobile", number> = {
  desktop: 1080,
  mobile: 390,
};

export const Canvas = () => {
  const {
    page,
    viewport,
    setSelection,
    moveRow,
    addRowAt,
    addRowWithElement,
  } = useEditor();

  const handleRowDropAt = useCallback(
    (fromRowId: string, placeAfter: boolean, targetRowId: string) => {
      const fromIndex = page.rows.findIndex((r) => r.id === fromRowId);
      let toIndex = page.rows.findIndex((r) => r.id === targetRowId);
      if (fromIndex < 0 || toIndex < 0) return;
      if (placeAfter) toIndex += 1;
      if (toIndex > fromIndex) toIndex -= 1;
      moveRow(fromIndex, toIndex);
    },
    [moveRow, page.rows]
  );

  const handleEmptyCanvasDrop = (e: React.DragEvent) => {
    if (!dragHasNewElement(e.dataTransfer)) return;
    e.preventDefault();
    const type = readNewElementDrag(e.dataTransfer);
    if (!type) return;
    addRowWithElement(type);
  };

  return (
    <div
      className="edt-canvas-scroll"
      onClick={() => setSelection(null)}
    >
      <div
        className="edt-canvas-paper"
        style={{
          maxWidth: VIEWPORT_WIDTH[viewport],
          backgroundColor: page.backgroundColor,
          paddingTop: page.paddingY,
          paddingBottom: page.paddingY,
          paddingLeft: page.paddingX,
          paddingRight: page.paddingX,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {page.rows.length === 0 ? (
          <div
            onDragOver={(e) => {
              if (dragHasNewElement(e.dataTransfer)) e.preventDefault();
            }}
            onDrop={handleEmptyCanvasDrop}
            className="edt-canvas-empty"
          >
            <span>
              Click <kbd>+</kbd> or drop an element to start your page.
            </span>
            <button type="button" onClick={() => addRowAt(0)}>
              Add row
            </button>
          </div>
        ) : (
          page.rows.map((row, index) => (
            <CanvasRow
              key={row.id}
              row={row}
              rowIndex={index}
              totalRows={page.rows.length}
              onRowDropAt={(fromId, placeAfter) =>
                handleRowDropAt(fromId, placeAfter, row.id)
              }
            />
          ))
        )}
      </div>
    </div>
  );
};
