import type { PageElement } from "@src/pages/Editor/elements";
import { useDrag } from "@src/pages/Editor/state/DragContext";
import {
  useEditorActions,
  useEditorSelection,
} from "@src/pages/Editor/state/EditorContext";
import {
  dragHasAnyElement,
  dragHasElementMove,
  dragHasNewElement,
  readElementMoveDrag,
  readNewElementDrag,
} from "@src/pages/Editor/utils/dragData";

import { computeInsertIndex } from "./canvasDrop";
import { CanvasElementFrame } from "./CanvasElementFrame";

interface Props {
  rowId: string;
  rowIndex: number;
  column: PageElement[];
  columnIndex: number;
}

export const CanvasColumn = ({
  rowId,
  rowIndex,
  column,
  columnIndex,
}: Props) => {
  const selection = useEditorSelection();
  const { setSelection, addElement, moveElement } = useEditorActions();
  const { dragKind, source, dropTarget, endDrag, setDropTarget } = useDrag();
  const isColumnDropTarget =
    dropTarget?.rowId === rowId && dropTarget.columnIndex === columnIndex;
  const insertIndex = isColumnDropTarget ? dropTarget.insertIndex : -1;

  const handleDragOver = (e: React.DragEvent) => {
    if (!dragHasAnyElement(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = dragHasElementMove(e.dataTransfer)
      ? "move"
      : "copy";
    setDropTarget({
      rowId,
      columnIndex,
      insertIndex: computeInsertIndex(
        e.currentTarget as HTMLElement,
        e.clientY
      ),
    });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (isColumnDropTarget) setDropTarget(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!dragHasAnyElement(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    const idx = computeInsertIndex(e.currentTarget as HTMLElement, e.clientY);
    if (dragHasNewElement(e.dataTransfer)) {
      const type = readNewElementDrag(e.dataTransfer);
      if (type) addElement(rowId, columnIndex, type, idx);
    } else if (dragHasElementMove(e.dataTransfer)) {
      const src = readElementMoveDrag(e.dataTransfer);
      if (src) moveElement(src, { rowId, columnIndex, insertIndex: idx });
    }
    endDrag();
  };

  const renderedChildren: React.ReactNode[] = [];
  for (let i = 0; i <= column.length; i++) {
    if (insertIndex === i) {
      renderedChildren.push(<div key="drop-line" className="edt-drop-line" />);
    }
    if (i < column.length) {
      const element = column[i];
      const isSelected =
        selection?.kind === "element" && selection.elementId === element.id;
      const isGhost =
        dragKind === "existing-element" && source?.elementId === element.id;
      renderedChildren.push(
        <CanvasElementFrame
          key={element.id}
          rowId={rowId}
          columnIndex={columnIndex}
          element={element}
          elementIndex={i}
          columnLength={column.length}
          isSelected={isSelected}
          isGhost={isGhost}
        />
      );
    }
  }

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Empty editor columns use click-to-select row behavior while actual keyboard selection lives on row/element surfaces.
    <div
      data-testid={`canvas-column-${rowIndex + 1}-${columnIndex + 1}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setSelection({ kind: "row", rowId });
        }
      }}
      className={
        "edt-column" + (isColumnDropTarget ? " edt-column--drop-zone" : "")
      }
    >
      {column.length === 0 && !isColumnDropTarget && (
        <div className="edt-column__placeholder">Drop element</div>
      )}
      {renderedChildren}
    </div>
  );
};
