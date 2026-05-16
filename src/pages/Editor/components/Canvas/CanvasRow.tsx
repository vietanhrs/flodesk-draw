import { useMemo, useState } from "react";

import { AddRowButton } from "./AddRowButton";
import { ElementRenderer } from "./ElementRenderer";
import { RowFloatingMenu } from "./RowFloatingMenu";
import { useEditor } from "../../state/EditorContext";
import type { PageRow } from "../../state/types";
import {
  dragHasNewElement,
  dragHasRow,
  readNewElementDrag,
  readRowDrag,
  setRowDrag,
} from "../../utils/dragData";

interface Props {
  row: PageRow;
  rowIndex: number;
  totalRows: number;
  onRowDropAt: (fromRowId: string, placeAfter: boolean) => void;
}

export const CanvasRow = ({
  row,
  rowIndex,
  totalRows,
  onRowDropAt,
}: Props) => {
  const {
    selection,
    setSelection,
    addRowAt,
    addElement,
    deleteElement,
  } = useEditor();

  const isRowSelected =
    selection?.kind === "row" && selection.rowId === row.id;
  const hasSelectedChild =
    selection?.kind === "element" && selection.rowId === row.id;
  const showRowChrome = isRowSelected || hasSelectedChild;

  const [isHovered, setIsHovered] = useState(false);
  const [edgeIndicator, setEdgeIndicator] = useState<"above" | "below" | null>(
    null
  );
  const [dropColumnIdx, setDropColumnIdx] = useState<number | null>(null);

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
    } else if (dragHasNewElement(e.dataTransfer)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }
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
      setDropColumnIdx(null);
    }
  };

  const handleSelectRow = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelection({ kind: "row", rowId: row.id });
    }
  };

  return (
    <div
      className="group/row relative"
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
        <div className="absolute -top-0.5 left-0 right-0 h-1 bg-blue9 z-10 pointer-events-none" />
      )}
      {edgeIndicator === "below" && (
        <div className="absolute -bottom-0.5 left-0 right-0 h-1 bg-blue9 z-10 pointer-events-none" />
      )}

      <div
        draggable
        onDragStart={handleRowDragStart}
        onDragEnd={handleRowDragEnd}
        onClick={handleSelectRow}
        aria-label={`Row ${rowIndex + 1}`}
        className={[
          "relative cursor-move",
          showRowChrome
            ? "outline-2 outline-blue9 outline-dashed -outline-offset-2"
            : isHovered
            ? "outline outline-blue7 outline-dashed -outline-offset-2"
            : "",
        ].join(" ")}
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
            const isColumnDrop = dropColumnIdx === columnIndex;
            return (
              <div
                key={columnIndex}
                onDragOver={(e) => {
                  if (!dragHasNewElement(e.dataTransfer)) return;
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "copy";
                  setDropColumnIdx(columnIndex);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDropColumnIdx((idx) =>
                      idx === columnIndex ? null : idx
                    );
                  }
                }}
                onDrop={(e) => {
                  if (!dragHasNewElement(e.dataTransfer)) return;
                  e.preventDefault();
                  e.stopPropagation();
                  const type = readNewElementDrag(e.dataTransfer);
                  setDropColumnIdx(null);
                  if (type) addElement(row.id, columnIndex, type);
                }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setSelection({ kind: "row", rowId: row.id });
                  }
                }}
                className={[
                  "min-h-15 flex flex-col gap-4 transition-colors",
                  isColumnDrop ? "bg-overlay" : "",
                ].join(" ")}
              >
                {column.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-content3 text-xs uppercase tracking-caps font-flodesk py-6 border border-dashed border-border2 rounded-sm">
                    Drop element
                  </div>
                )}
                {column.map((element) => {
                  const isSelected =
                    selection?.kind === "element" &&
                    selection.elementId === element.id;
                  return (
                    <div
                      key={element.id}
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
                      className={[
                        "relative cursor-pointer outline-none",
                        isSelected
                          ? "ring-2 ring-blue9 ring-offset-2 ring-offset-transparent"
                          : "hover:ring-1 hover:ring-blue7",
                      ].join(" ")}
                    >
                      <ElementRenderer element={element} />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
