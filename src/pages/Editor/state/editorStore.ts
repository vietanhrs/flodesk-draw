import { create } from "zustand";

import type { ElementType, PageElement } from "@src/pages/Editor/elements";
import type { LoadedFile } from "@src/pages/Editor/exporter/flodeskFile";
import { createId } from "@src/pages/Editor/utils/ids";

import type { DragSource, DropTarget } from "./DragContext";
import { findElementDefinition } from "./elementCatalog";
import {
  commitHistory,
  redoHistory,
  undoHistory,
  type HistoryStack,
} from "./history";
import { buildPageForTemplate } from "./initialData";
import {
  cloneRow,
  evenWidths,
  insertAt,
  move,
  newEmptyColumns,
  replaceElement,
  replaceRow,
} from "./pageOperations";
import type { PageData, PageRow, Selection, Viewport } from "./types";

export interface EditorActions {
  updatePage: (patch: Partial<PageData>, debounceKey?: string) => void;
  updateRow: (
    rowId: string,
    patch: Partial<PageRow>,
    debounceKey?: string
  ) => void;
  setRowColumnsCount: (rowId: string, count: 1 | 2 | 3 | 4) => void;
  setColumnWidth: (rowId: string, index: number, width: number) => void;
  updateElement: <T extends PageElement>(
    rowId: string,
    elementId: string,
    patch: Partial<T>,
    debounceKey?: string
  ) => void;
  addRowAt: (index: number) => void;
  moveRow: (fromIndex: number, toIndex: number) => void;
  duplicateRow: (rowId: string) => void;
  deleteRow: (rowId: string) => void;
  addElement: (
    rowId: string,
    columnIndex: number,
    type: ElementType,
    insertIndex?: number
  ) => void;
  addRowWithElement: (type: ElementType) => void;
  duplicateElement: (
    rowId: string,
    columnIndex: number,
    elementId: string
  ) => void;
  deleteElement: (rowId: string, elementId: string) => void;
  moveElement: (source: DragSource, target: DropTarget) => void;
  setSelection: (sel: Selection) => void;
  setViewport: (v: Viewport) => void;
  toggleMenu: (open?: boolean) => void;
  undo: () => void;
  redo: () => void;
  resetTo: (page: PageData) => void;
  setLoadedFile: (file: LoadedFile | null) => void;
}

export interface EditorStoreState {
  history: HistoryStack;
  selection: Selection;
  viewport: Viewport;
  isElementMenuOpen: boolean;
  loadedFile: LoadedFile | null;
  lastCommitKey: string | null;
  lastCommitAt: number;
  actions: EditorActions;
}

interface InitialStateSeed {
  templateId?: string;
  initialFile?: LoadedFile;
}

const createInitialStoreState = ({
  templateId,
  initialFile,
}: InitialStateSeed): Omit<EditorStoreState, "actions"> => ({
  history: {
    past: [],
    present: initialFile?.page ?? buildPageForTemplate(templateId),
    future: [],
  },
  selection: null,
  viewport: "desktop",
  isElementMenuOpen: true,
  loadedFile: initialFile ?? null,
  lastCommitKey: null,
  lastCommitAt: 0,
});

const createEmptyRow = (): PageRow => ({
  id: createId("row"),
  backgroundColor: "transparent",
  paddingX: 64,
  paddingY: 40,
  marginY: 0,
  columnsCount: 1,
  columnWidths: [1],
  columnGap: 24,
  columns: newEmptyColumns(1),
});

export const useEditorStore = create<EditorStoreState>((set, get) => {
  const commit = (next: PageData, debounceKey?: string) => {
    const state = get();
    set({
      ...commitHistory(state.history, next, {
        debounceKey,
        lastCommitKey: state.lastCommitKey,
        lastCommitAt: state.lastCommitAt,
      }),
    });
  };

  const actions: EditorActions = {
    updatePage: (patch, debounceKey) => {
      const current = get().history.present;
      commit({ ...current, ...patch }, debounceKey);
    },

    updateRow: (rowId, patch, debounceKey) => {
      const current = get().history.present;
      commit(
        replaceRow(current, rowId, (r) => ({ ...r, ...patch })),
        debounceKey
      );
    },

    setRowColumnsCount: (rowId, count) => {
      const current = get().history.present;
      const next = replaceRow(current, rowId, (row) => {
        if (row.columnsCount === count) return row;
        const columns = [...row.columns];
        if (count > columns.length) {
          while (columns.length < count) columns.push([]);
        } else {
          const overflow = columns.slice(count).flat();
          columns.length = count;
          if (overflow.length > 0) {
            columns[count - 1] = [...columns[count - 1], ...overflow];
          }
        }
        return {
          ...row,
          columnsCount: count,
          columnWidths: evenWidths(count),
          columns,
        };
      });
      commit(next);
    },

    setColumnWidth: (rowId, index, width) => {
      const current = get().history.present;
      const next = replaceRow(current, rowId, (row) => {
        const widths = [...row.columnWidths];
        widths[index] = Math.max(0.1, width);
        return { ...row, columnWidths: widths };
      });
      commit(next, `col-width-${rowId}-${index}`);
    },

    updateElement: (rowId, elementId, patch, debounceKey) => {
      const current = get().history.present;
      commit(
        replaceElement(current, rowId, elementId, (el) => ({
          ...el,
          ...patch,
        })),
        debounceKey
      );
    },

    addRowAt: (index) => {
      const current = get().history.present;
      const newRow = createEmptyRow();
      commit({ ...current, rows: insertAt(current.rows, newRow, index) });
      set({ selection: { kind: "row", rowId: newRow.id } });
    },

    moveRow: (fromIndex, toIndex) => {
      const current = get().history.present;
      commit({ ...current, rows: move(current.rows, fromIndex, toIndex) });
    },

    duplicateRow: (rowId) => {
      const current = get().history.present;
      const index = current.rows.findIndex((r) => r.id === rowId);
      if (index < 0) return;
      const dup = cloneRow(current.rows[index]);
      commit({ ...current, rows: insertAt(current.rows, dup, index + 1) });
      set({ selection: { kind: "row", rowId: dup.id } });
    },

    deleteRow: (rowId) => {
      const current = get().history.present;
      commit({ ...current, rows: current.rows.filter((r) => r.id !== rowId) });
      set({ selection: null });
    },

    addElement: (rowId, columnIndex, type, insertIndex) => {
      const def = findElementDefinition(type);
      if (!def) return;
      const current = get().history.present;
      const newEl = def.create();
      const next = replaceRow(current, rowId, (row) => ({
        ...row,
        columns: row.columns.map((col, i) =>
          i === columnIndex
            ? insertAt(col, newEl, insertIndex ?? col.length)
            : col
        ),
      }));
      commit(next);
      set({
        selection: {
          kind: "element",
          rowId,
          columnIndex,
          elementId: newEl.id,
        },
      });
    },

    addRowWithElement: (type) => {
      const def = findElementDefinition(type);
      if (!def) return;
      const current = get().history.present;
      const newEl = def.create();
      const newRow: PageRow = {
        ...createEmptyRow(),
        columns: [[newEl]],
      };
      commit({ ...current, rows: [...current.rows, newRow] });
      set({
        selection: {
          kind: "element",
          rowId: newRow.id,
          columnIndex: 0,
          elementId: newEl.id,
        },
      });
    },

    duplicateElement: (rowId, columnIndex, elementId) => {
      const current = get().history.present;
      const row = current.rows.find((r) => r.id === rowId);
      const col = row?.columns[columnIndex];
      if (!col) return;
      const elIdx = col.findIndex((el) => el.id === elementId);
      if (elIdx < 0) return;
      const clone = { ...col[elIdx], id: createId("el") };
      const next = replaceRow(current, rowId, (r) => ({
        ...r,
        columns: r.columns.map((c, i) =>
          i === columnIndex ? insertAt(c, clone, elIdx + 1) : c
        ),
      }));
      commit(next);
      set({
        selection: {
          kind: "element",
          rowId,
          columnIndex,
          elementId: clone.id,
        },
      });
    },

    deleteElement: (rowId, elementId) => {
      const current = get().history.present;
      const next = replaceRow(current, rowId, (row) => ({
        ...row,
        columns: row.columns.map((col) =>
          col.filter((el) => el.id !== elementId)
        ),
      }));
      commit(next);
      set({ selection: { kind: "row", rowId } });
    },

    moveElement: (source, target) => {
      const current = get().history.present;
      const srcRow = current.rows.find((r) => r.id === source.rowId);
      const srcCol = srcRow?.columns[source.columnIndex];
      if (!srcCol) return;
      const srcElIdx = srcCol.findIndex((el) => el.id === source.elementId);
      if (srcElIdx < 0) return;
      const element = srcCol[srcElIdx];

      const isSameColumn =
        source.rowId === target.rowId &&
        source.columnIndex === target.columnIndex;

      let adjustedInsert = target.insertIndex;
      if (isSameColumn && adjustedInsert > srcElIdx) adjustedInsert -= 1;
      if (isSameColumn && adjustedInsert === srcElIdx) return;

      const nextRows = current.rows.map((row) => {
        if (row.id !== source.rowId && row.id !== target.rowId) return row;
        const columns = row.columns.map((col, idx) => {
          let next = col;
          if (
            row.id === source.rowId &&
            idx === source.columnIndex &&
            !(isSameColumn && idx === target.columnIndex)
          ) {
            next = next.filter((el) => el.id !== source.elementId);
          }
          if (
            row.id === source.rowId &&
            isSameColumn &&
            idx === source.columnIndex
          ) {
            const without = next.filter((el) => el.id !== source.elementId);
            return insertAt(without, element, adjustedInsert);
          }
          if (
            row.id === target.rowId &&
            idx === target.columnIndex &&
            !isSameColumn
          ) {
            return insertAt(next, element, adjustedInsert);
          }
          return next;
        });
        return { ...row, columns };
      });

      commit({ ...current, rows: nextRows });
      set({
        selection: {
          kind: "element",
          rowId: target.rowId,
          columnIndex: target.columnIndex,
          elementId: element.id,
        },
      });
    },

    setSelection: (selection) => set({ selection }),
    setViewport: (viewport) => set({ viewport }),
    toggleMenu: (open) =>
      set((state) => ({
        isElementMenuOpen:
          typeof open === "boolean" ? open : !state.isElementMenuOpen,
      })),
    undo: () =>
      set((state) => {
        const history = undoHistory(state.history);
        return history ? { history, lastCommitKey: null } : {};
      }),
    redo: () =>
      set((state) => {
        const history = redoHistory(state.history);
        return history ? { history, lastCommitKey: null } : {};
      }),
    resetTo: (page) =>
      set({
        history: { past: [], present: page, future: [] },
        selection: null,
        lastCommitKey: null,
        lastCommitAt: 0,
      }),
    setLoadedFile: (loadedFile) => set({ loadedFile }),
  };

  return {
    ...createInitialStoreState({}),
    actions,
  };
});

export const initializeEditorStore = (seed: InitialStateSeed) => {
  useEditorStore.setState((state) => ({
    ...createInitialStoreState(seed),
    actions: state.actions,
  }));
};
