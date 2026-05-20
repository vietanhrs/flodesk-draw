import { create } from "zustand";

import type { ElementType, PageElement } from "@src/pages/Editor/elements";
import type { LoadedFile } from "@src/pages/Editor/exporter/flodeskFile";

import type { DragSource, DropTarget } from "./DragContext";
import { createEditorActions } from "./editorActions";
import {
  commitHistory,
  redoHistory,
  undoHistory,
  type HistoryStack,
} from "./history";
import { buildPageForTemplate } from "./initialData";
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

  const actions = createEditorActions(set, get, commit, {
    undoHistory,
    redoHistory,
  });

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
