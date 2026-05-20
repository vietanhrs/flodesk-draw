import {
  IconArrowDown,
  IconArrowUp,
  IconDuplicate,
  IconTrash,
} from "@flodesk/grain";

import { useEditorActions } from "@src/pages/Editor/state/EditorContext";

import { FloatingMenu } from "./FloatingMenu";

interface Props {
  rowId: string;
  columnIndex: number;
  elementId: string;
  elementIndex: number;
  columnLength: number;
}

export const ElementFloatingMenu = ({
  rowId,
  columnIndex,
  elementId,
  elementIndex,
  columnLength,
}: Props) => {
  const { moveElement, duplicateElement, deleteElement } = useEditorActions();
  const source = { rowId, columnIndex, elementId };

  return (
    <FloatingMenu
      ariaLabel="Element actions"
      className="edt-floating-menu--element"
      actions={[
        {
          label: "Move element up",
          icon: IconArrowUp,
          disabled: elementIndex === 0,
          // moveElement adjusts insertIndex for source removal when the target
          // is the same column, so plain (elementIndex - 1) lands above the
          // previous sibling.
          onClick: () =>
            moveElement(source, {
              rowId,
              columnIndex,
              insertIndex: elementIndex - 1,
            }),
        },
        {
          label: "Move element down",
          icon: IconArrowDown,
          disabled: elementIndex >= columnLength - 1,
          // To land below the next sibling we ask for insertIndex+2 — after
          // moveElement decrements for the same-column removal we end up at
          // (elementIndex + 1), one slot past the original neighbour.
          onClick: () =>
            moveElement(source, {
              rowId,
              columnIndex,
              insertIndex: elementIndex + 2,
            }),
        },
        {
          label: "Duplicate element",
          icon: IconDuplicate,
          onClick: () => duplicateElement(rowId, columnIndex, elementId),
        },
        {
          label: "Delete element",
          icon: IconTrash,
          danger: true,
          onClick: () => deleteElement(rowId, elementId),
        },
      ]}
    />
  );
};
