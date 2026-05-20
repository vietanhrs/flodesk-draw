import { useMemo, useState } from "react";

import { useDrag } from "@src/pages/Editor/state/DragContext";
import {
  useEditorActions,
  useEditorSelection,
} from "@src/pages/Editor/state/EditorContext";
import type { PageRow } from "@src/pages/Editor/state/types";
import {
  dragHasAnyElement,
  dragHasElementMove,
  dragHasNewElement,
  dragHasRow,
  readElementMoveDrag,
  readNewElementDrag,
  readRowDrag,
  setElementMoveDrag,
  setRowDrag,
} from "@src/pages/Editor/utils/dragData";

import { AddRowButton } from "./AddRowButton";
import { ElementFloatingMenu } from "./ElementFloatingMenu";
import { ElementRenderer } from "./ElementRenderer";
import { RowFloatingMenu } from "./RowFloatingMenu";

interface Props {
  row: PageRow;
  rowIndex: number;
  totalRows: number;
  onRowDropAt: (fromRowId: string, placeAfter: boolean) => void;
}

const computeInsertIndex = (column: HTMLElement, clientY: number): number => {
  const items = column.querySelectorAll<HTMLElement>("[data-element-index]");
  for (let i = 0; i < items.length; i++) {
    const rect = items[i].getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (clientY < midY) return i;
  }
  return items.length;
};

export const CanvasRow = ({ row, rowIndex, totalRows, onRowDropAt }: Props) => {
  const selection = useEditorSelection();
  const { setSelection, addRowAt, addElement, deleteElement, moveElement } =
    useEditorActions();
  const { dragKind, source, dropTarget, beginDrag, endDrag, setDropTarget } =
    useDrag();

  const isRowSelected = selection?.kind === "row" && selection.rowId === row.id;
  const hasSelectedChild =
    selection?.kind === "element" && selection.rowId === row.id;
  const showRowChrome = isRowSelected || hasSelectedChild;

  const [isHovered, setIsHovered] = useState(false);
  const [edgeIndicator, setEdgeIndicator] = useState<"above" | "below" | null>(
    null
  );

  const totalWidth = useMemo(
    () => row.columnWidths.reduce((a, b) => a + b, 0),
    [row.columnWidths]
  );

  const handleRowDragStart = (e: React.DragEvent) => {
    setRowDrag(e.dataTransfer, row.id);
  };

  const handleRowDragEnd = () => {
    setEdgeIndicator(null);
  };

  const handleRowDragOver = (e: React.DragEvent) => {
    if (dragHasRow(e.dataTransfer)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      setEdgeIndicator(e.clientY < midpoint ? "above" : "below");
    }
    // Element drags are handled at the column level. If the cursor is in the
    // row padding (i.e. the column didn't stopPropagation), we deliberately
    // do NOT preventDefault — the OS shows a "no-drop" cursor, matching the
    // requirement that padding/margin is not a valid drop zone.
  };

  const handleRowDrop = (e: React.DragEvent) => {
    if (!dragHasRow(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    const fromId = readRowDrag(e.dataTransfer);
    const rect = e.currentTarget.getBoundingClientRect();
    const midpoint = rect.top + rect.height / 2;
    const placeAfter = e.clientY >= midpoint;
    setEdgeIndicator(null);
    if (fromId && fromId !== row.id) onRowDropAt(fromId, placeAfter);
  };

  const handleRowDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setEdgeIndicator(null);
    }
  };

  const handleSelectRow = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelection({ kind: "row", rowId: row.id });
    }
  };

  return (
    // The outer id is for counting rows; the inner id targets the draggable
    // surface because row chrome is positioned as a sibling.
    <div
      data-testid="canvas-row"
      className="edt-row"
      style={{ marginTop: row.marginY, marginBottom: row.marginY }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragOver={handleRowDragOver}
      onDragLeave={handleRowDragLeave}
      onDrop={handleRowDrop}
    >
      {(isHovered || showRowChrome) && (
        <>
          <AddRowButton position="top" onClick={() => addRowAt(rowIndex)} />
          <AddRowButton
            position="bottom"
            onClick={() => addRowAt(rowIndex + 1)}
          />
        </>
      )}

      {showRowChrome && (
        <RowFloatingMenu
          rowId={row.id}
          rowIndex={rowIndex}
          totalRows={totalRows}
        />
      )}

      {edgeIndicator === "above" && (
        <div className="edt-row__edge edt-row__edge--top" />
      )}
      {edgeIndicator === "below" && (
        <div className="edt-row__edge edt-row__edge--bottom" />
      )}

      <div
        // This complements the outer canvas-row test id above.
        data-testid={`canvas-row-${rowIndex + 1}`}
        draggable
        onDragStart={handleRowDragStart}
        onDragEnd={handleRowDragEnd}
        onClick={handleSelectRow}
        aria-label={`Row ${rowIndex + 1}`}
        className={
          "edt-row__inner" +
          (showRowChrome
            ? " edt-row__inner--active"
            : isHovered
              ? " edt-row__inner--hover"
              : "")
        }
        style={{
          backgroundColor: row.backgroundColor,
          paddingLeft: row.paddingX,
          paddingRight: row.paddingX,
          paddingTop: row.paddingY,
          paddingBottom: row.paddingY,
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: row.columnWidths
              .map((w) => `${(w / totalWidth) * 100}fr`)
              .join(" "),
            gap: row.columnGap,
            alignItems: "start",
          }}
        >
          {row.columns.map((column, columnIndex) => {
            const isColumnDropTarget =
              dropTarget?.rowId === row.id &&
              dropTarget.columnIndex === columnIndex;
            const insertIndex = isColumnDropTarget
              ? dropTarget.insertIndex
              : -1;

            const handleColumnDragOver = (e: React.DragEvent) => {
              if (!dragHasAnyElement(e.dataTransfer)) return;
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = dragHasElementMove(e.dataTransfer)
                ? "move"
                : "copy";
              const idx = computeInsertIndex(
                e.currentTarget as HTMLElement,
                e.clientY
              );
              setDropTarget({ rowId: row.id, columnIndex, insertIndex: idx });
            };

            const handleColumnDragLeave = (e: React.DragEvent) => {
              if (e.currentTarget.contains(e.relatedTarget as Node)) return;
              if (
                dropTarget?.rowId === row.id &&
                dropTarget.columnIndex === columnIndex
              ) {
                setDropTarget(null);
              }
            };

            const handleColumnDrop = (e: React.DragEvent) => {
              if (!dragHasAnyElement(e.dataTransfer)) return;
              e.preventDefault();
              e.stopPropagation();
              const idx = computeInsertIndex(
                e.currentTarget as HTMLElement,
                e.clientY
              );
              if (dragHasNewElement(e.dataTransfer)) {
                const type = readNewElementDrag(e.dataTransfer);
                if (type) addElement(row.id, columnIndex, type, idx);
              } else if (dragHasElementMove(e.dataTransfer)) {
                const src = readElementMoveDrag(e.dataTransfer);
                if (src) {
                  moveElement(src, {
                    rowId: row.id,
                    columnIndex,
                    insertIndex: idx,
                  });
                }
              }
              endDrag();
            };

            const dropLine = <div key="drop-line" className="edt-drop-line" />;

            const renderedChildren: React.ReactNode[] = [];
            for (let i = 0; i <= column.length; i++) {
              if (insertIndex === i) renderedChildren.push(dropLine);
              if (i < column.length) {
                const element = column[i];
                const isSelected =
                  selection?.kind === "element" &&
                  selection.elementId === element.id;
                const isGhost =
                  dragKind === "existing-element" &&
                  source?.elementId === element.id;
                renderedChildren.push(
                  <div
                    key={element.id}
                    data-element-index={i}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setElementMoveDrag(e.dataTransfer, {
                        rowId: row.id,
                        columnIndex,
                        elementId: element.id,
                      });
                      beginDrag("existing-element", {
                        rowId: row.id,
                        columnIndex,
                        elementId: element.id,
                      });
                    }}
                    onDragEnd={() => endDrag()}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelection({
                        kind: "element",
                        rowId: row.id,
                        columnIndex,
                        elementId: element.id,
                      });
                    }}
                    onKeyDown={(e) => {
                      const target = e.target as HTMLElement;
                      if (
                        target.tagName === "INPUT" ||
                        target.tagName === "TEXTAREA" ||
                        target.isContentEditable
                      )
                        return;
                      if (
                        isSelected &&
                        (e.key === "Delete" || e.key === "Backspace")
                      ) {
                        e.preventDefault();
                        deleteElement(row.id, element.id);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${element.type} element`}
                    aria-pressed={isSelected}
                    className={
                      "edt-element" +
                      (isSelected ? " edt-element--selected" : "") +
                      (isGhost ? " edt-element--ghost" : "")
                    }
                  >
                    {isSelected && (
                      <ElementFloatingMenu
                        rowId={row.id}
                        columnIndex={columnIndex}
                        elementId={element.id}
                        elementIndex={i}
                        columnLength={column.length}
                      />
                    )}
                    <ElementRenderer element={element} />
                  </div>
                );
              }
            }

            return (
              <div
                data-testid={`canvas-column-${rowIndex + 1}-${columnIndex + 1}`}
                key={columnIndex}
                onDragOver={handleColumnDragOver}
                onDragLeave={handleColumnDragLeave}
                onDrop={handleColumnDrop}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelection({ kind: "row", rowId: row.id });
                  }
                }}
                className={
                  "edt-column" +
                  (isColumnDropTarget ? " edt-column--drop-zone" : "")
                }
              >
                {column.length === 0 && !isColumnDropTarget && (
                  <div className="edt-column__placeholder">Drop element</div>
                )}
                {renderedChildren}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
