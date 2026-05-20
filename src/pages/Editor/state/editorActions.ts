import type { StoreApi } from "zustand";

import {
  addElementRowToPage,
  addElementToPage,
  addRowToPage,
  deleteElementFromPage,
  duplicateElementOnPage,
  duplicateRowOnPage,
  moveElementOnPage,
  moveRowOnPage,
  setColumnWidthOnPage,
  setRowColumnsCountOnPage,
} from "./editorMutations";
import type { EditorActions, EditorStoreState } from "./editorStore";
import { findElementDefinition } from "./elementCatalog";
import type { HistoryStack } from "./history";
import { replaceElement, replaceRow } from "./pageOperations";
import type { PageData } from "./types";

type EditorStoreSet = StoreApi<EditorStoreState>["setState"];
type EditorStoreGet = StoreApi<EditorStoreState>["getState"];
type CommitPage = (next: PageData, debounceKey?: string) => void;

interface HistoryHelpers {
  undoHistory: (history: HistoryStack) => HistoryStack | null;
  redoHistory: (history: HistoryStack) => HistoryStack | null;
}

const selectElement = (
  rowId: string,
  columnIndex: number,
  elementId: string
) => ({
  selection: { kind: "element" as const, rowId, columnIndex, elementId },
});

export const createEditorActions = (
  set: EditorStoreSet,
  get: EditorStoreGet,
  commit: CommitPage,
  historyHelpers: HistoryHelpers
): EditorActions => ({
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
    commit(setRowColumnsCountOnPage(get().history.present, rowId, count));
  },

  setColumnWidth: (rowId, index, width) => {
    commit(
      setColumnWidthOnPage(get().history.present, rowId, index, width),
      `col-width-${rowId}-${index}`
    );
  },

  updateElement: (rowId, elementId, patch, debounceKey) => {
    const current = get().history.present;
    commit(
      replaceElement(current, rowId, elementId, (el) => ({ ...el, ...patch })),
      debounceKey
    );
  },

  addRowAt: (index) => {
    const result = addRowToPage(get().history.present, index);
    commit(result.page);
    set({ selection: { kind: "row", rowId: result.row.id } });
  },

  moveRow: (fromIndex, toIndex) => {
    commit(moveRowOnPage(get().history.present, fromIndex, toIndex));
  },

  duplicateRow: (rowId) => {
    const result = duplicateRowOnPage(get().history.present, rowId);
    if (!result) return;
    commit(result.page);
    set({ selection: { kind: "row", rowId: result.row.id } });
  },

  deleteRow: (rowId) => {
    const current = get().history.present;
    commit({ ...current, rows: current.rows.filter((r) => r.id !== rowId) });
    set({ selection: null });
  },

  addElement: (rowId, columnIndex, type, insertIndex) => {
    const def = findElementDefinition(type);
    if (!def) return;
    const element = def.create();
    commit(
      addElementToPage(
        get().history.present,
        rowId,
        columnIndex,
        element,
        insertIndex
      )
    );
    set(selectElement(rowId, columnIndex, element.id));
  },

  addRowWithElement: (type) => {
    const def = findElementDefinition(type);
    if (!def) return;
    const element = def.create();
    const result = addElementRowToPage(get().history.present, element);
    commit(result.page);
    set(selectElement(result.row.id, 0, element.id));
  },

  duplicateElement: (rowId, columnIndex, elementId) => {
    const result = duplicateElementOnPage(
      get().history.present,
      rowId,
      columnIndex,
      elementId
    );
    if (!result) return;
    commit(result.page);
    set(selectElement(rowId, columnIndex, result.element.id));
  },

  deleteElement: (rowId, elementId) => {
    commit(deleteElementFromPage(get().history.present, rowId, elementId));
    set({ selection: { kind: "row", rowId } });
  },

  moveElement: (source, target) => {
    const result = moveElementOnPage(get().history.present, source, target);
    if (!result) return;
    commit(result.page);
    set(selectElement(target.rowId, target.columnIndex, result.element.id));
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
      const history = historyHelpers.undoHistory(state.history);
      return history ? { history, lastCommitKey: null } : {};
    }),
  redo: () =>
    set((state) => {
      const history = historyHelpers.redoHistory(state.history);
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
});
