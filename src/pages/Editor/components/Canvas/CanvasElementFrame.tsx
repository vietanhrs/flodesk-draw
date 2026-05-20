import type { PageElement } from "@src/pages/Editor/elements";
import { useDrag } from "@src/pages/Editor/state/DragContext";
import { useEditorActions } from "@src/pages/Editor/state/EditorContext";
import { setElementMoveDrag } from "@src/pages/Editor/utils/dragData";

import { isEditableTarget, isKeyboardActivation } from "./canvasDrop";
import { ElementFloatingMenu } from "./ElementFloatingMenu";
import { ElementRenderer } from "./ElementRenderer";

interface Props {
  rowId: string;
  columnIndex: number;
  element: PageElement;
  elementIndex: number;
  columnLength: number;
  isSelected: boolean;
  isGhost: boolean;
}

export const CanvasElementFrame = ({
  rowId,
  columnIndex,
  element,
  elementIndex,
  columnLength,
  isSelected,
  isGhost,
}: Props) => {
  const { setSelection, deleteElement } = useEditorActions();
  const { beginDrag, endDrag } = useDrag();

  const selectElement = () =>
    setSelection({
      kind: "element",
      rowId,
      columnIndex,
      elementId: element.id,
    });

  return (
    <div
      data-element-index={elementIndex}
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        const source = { rowId, columnIndex, elementId: element.id };
        setElementMoveDrag(e.dataTransfer, source);
        beginDrag("existing-element", source);
      }}
      onDragEnd={() => endDrag()}
      onClick={(e) => {
        e.stopPropagation();
        selectElement();
      }}
      onKeyDown={(e) => {
        if (isEditableTarget(e.target)) return;
        if (isKeyboardActivation(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          selectElement();
          return;
        }
        if (isSelected && (e.key === "Delete" || e.key === "Backspace")) {
          e.preventDefault();
          e.stopPropagation();
          deleteElement(rowId, element.id);
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
          rowId={rowId}
          columnIndex={columnIndex}
          elementId={element.id}
          elementIndex={elementIndex}
          columnLength={columnLength}
        />
      )}
      <ElementRenderer element={element} />
    </div>
  );
};
