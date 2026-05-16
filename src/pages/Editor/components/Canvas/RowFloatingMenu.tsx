import {
  IconArrowDown,
  IconArrowUp,
  IconDuplicate,
  IconTrash,
} from "@flodesk/grain";

import { useEditor } from "../../state/EditorContext";

interface Props {
  rowId: string;
  rowIndex: number;
  totalRows: number;
}

export const RowFloatingMenu = ({ rowId, rowIndex, totalRows }: Props) => {
  const { moveRow, duplicateRow, deleteRow } = useEditor();

  const baseBtn =
    "w-9 h-9 inline-flex items-center justify-center bg-shade1 hover:bg-shade2 disabled:opacity-40 disabled:cursor-not-allowed text-shade13 border border-border first:rounded-t-md last:rounded-b-md not-last:border-b-0";

  return (
    <div
      className="absolute top-2 -right-13 z-20 flex flex-col shadow-m rounded-md bg-shade1"
      role="toolbar"
      aria-label="Row actions"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        title="Move row up"
        aria-label="Move row up"
        className={baseBtn}
        disabled={rowIndex === 0}
        onClick={() => moveRow(rowIndex, rowIndex - 1)}
      >
        <IconArrowUp width={16} height={16} />
      </button>
      <button
        type="button"
        title="Move row down"
        aria-label="Move row down"
        className={baseBtn}
        disabled={rowIndex >= totalRows - 1}
        onClick={() => moveRow(rowIndex, rowIndex + 1)}
      >
        <IconArrowDown width={16} height={16} />
      </button>
      <button
        type="button"
        title="Duplicate row"
        aria-label="Duplicate row"
        className={baseBtn}
        onClick={() => duplicateRow(rowId)}
      >
        <IconDuplicate width={16} height={16} />
      </button>
      <button
        type="button"
        title="Delete row"
        aria-label="Delete row"
        className={`${baseBtn} text-contentDanger`}
        onClick={() => deleteRow(rowId)}
      >
        <IconTrash width={16} height={16} />
      </button>
    </div>
  );
};
