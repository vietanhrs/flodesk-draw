import { useMemo, useState } from "react";

import {
  useEditorActions,
  useEditorSelection,
} from "@src/pages/Editor/state/EditorContext";
import type { PageRow } from "@src/pages/Editor/state/types";
import {
  dragHasRow,
  readRowDrag,
  setRowDrag,
} from "@src/pages/Editor/utils/dragData";

import { AddRowButton } from "./AddRowButton";
import { CanvasColumn } from "./CanvasColumn";
import { isKeyboardActivation } from "./canvasDrop";
import { RowFloatingMenu } from "./RowFloatingMenu";

interface Props {
  row: PageRow;
  rowIndex: number;
  totalRows: number;
  onRowDropAt: (fromRowId: string, placeAfter: boolean) => void;
}

export const CanvasRow = ({ row, rowIndex, totalRows, onRowDropAt }: Props) => {
  const selection = useEditorSelection();
  const { setSelection, addRowAt } = useEditorActions();
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

  const handleRowDragOver = (e: React.DragEvent) => {
    if (dragHasRow(e.dataTransfer)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      setEdgeIndicator(e.clientY < midpoint ? "above" : "below");
    }
    // Element drags are handled at the column level. If the cursor is in the
    // row padding, the OS shows a "no-drop" cursor by design.
  };

  const handleRowDrop = (e: React.DragEvent) => {
    if (!dragHasRow(e.dataTransfer)) return;
    e.preventDefault();
    e.stopPropagation();
    const fromId = readRowDrag(e.dataTransfer);
    const rect = e.currentTarget.getBoundingClientRect();
    const placeAfter = e.clientY >= rect.top + rect.height / 2;
    setEdgeIndicator(null);
    if (fromId && fromId !== row.id) onRowDropAt(fromId, placeAfter);
  };

  const handleSelectRow = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelection({ kind: "row", rowId: row.id });
    }
  };

  const selectRow = () => setSelection({ kind: "row", rowId: row.id });

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
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setEdgeIndicator(null);
        }
      }}
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

      {/* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex -- Editor rows are custom drag surfaces; keyboard selection is covered in Editor.test.tsx. */}
      <div
        data-testid={`canvas-row-${rowIndex + 1}`}
        draggable
        onDragStart={(e) => setRowDrag(e.dataTransfer, row.id)}
        onDragEnd={() => setEdgeIndicator(null)}
        onClick={handleSelectRow}
        onKeyDown={(e) => {
          if (!isKeyboardActivation(e.key)) return;
          e.preventDefault();
          selectRow();
        }}
        tabIndex={0}
        role="group"
        aria-current={isRowSelected ? "true" : undefined}
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
        {/* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
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
          {row.columns.map((column, columnIndex) => (
            <CanvasColumn
              key={columnIndex}
              rowId={row.id}
              rowIndex={rowIndex}
              column={column}
              columnIndex={columnIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
