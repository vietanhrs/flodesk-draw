import {
  IconArrowDown,
  IconArrowUp,
  IconDuplicate,
  IconTrash,
} from "@flodesk/grain";

import { useEditor } from "@src/pages/Editor/state/EditorContext";

import { FloatingMenu } from "./FloatingMenu";

interface Props {
  rowId: string;
  rowIndex: number;
  totalRows: number;
}

export const RowFloatingMenu = ({ rowId, rowIndex, totalRows }: Props) => {
  const { moveRow, duplicateRow, deleteRow } = useEditor();

  return (
    <FloatingMenu
      ariaLabel="Row actions"
      className="edt-floating-menu--row"
      actions={[
        {
          label: "Move row up",
          icon: IconArrowUp,
          disabled: rowIndex === 0,
          onClick: () => moveRow(rowIndex, rowIndex - 1),
        },
        {
          label: "Move row down",
          icon: IconArrowDown,
          disabled: rowIndex >= totalRows - 1,
          onClick: () => moveRow(rowIndex, rowIndex + 1),
        },
        {
          label: "Duplicate row",
          icon: IconDuplicate,
          onClick: () => duplicateRow(rowId),
        },
        {
          label: "Delete row",
          icon: IconTrash,
          danger: true,
          onClick: () => deleteRow(rowId),
        },
      ]}
    />
  );
};
