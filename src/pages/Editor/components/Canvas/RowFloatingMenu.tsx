import {
  IconArrowDown,
  IconArrowUp,
  IconDuplicate,
  IconTrash,
} from "@flodesk/grain";

import { useEditor } from "@src/pages/Editor/state/EditorContext";

interface Props {
  rowId: string;
  rowIndex: number;
  totalRows: number;
}

export const RowFloatingMenu = ({ rowId, rowIndex, totalRows }: Props) => {
  const { moveRow, duplicateRow, deleteRow } = useEditor();

  return (
    <div
      className="edt-row-menu"
      role="toolbar"
      aria-label="Row actions"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        title="Move row up"
        aria-label="Move row up"
        disabled={rowIndex === 0}
        onClick={() => moveRow(rowIndex, rowIndex - 1)}
      >
        <IconArrowUp width={16} height={16} />
      </button>
      <button
        type="button"
        title="Move row down"
        aria-label="Move row down"
        disabled={rowIndex >= totalRows - 1}
        onClick={() => moveRow(rowIndex, rowIndex + 1)}
      >
        <IconArrowDown width={16} height={16} />
      </button>
      <button
        type="button"
        title="Duplicate row"
        aria-label="Duplicate row"
        onClick={() => duplicateRow(rowId)}
      >
        <IconDuplicate width={16} height={16} />
      </button>
      <button
        type="button"
        title="Delete row"
        aria-label="Delete row"
        className="edt-row-menu__danger"
        onClick={() => deleteRow(rowId)}
      >
        <IconTrash width={16} height={16} />
      </button>
    </div>
  );
};
