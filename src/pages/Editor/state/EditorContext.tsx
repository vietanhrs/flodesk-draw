/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";

import type { ElementType, PageElement } from "@src/pages/Editor/elements";
import { createId } from "@src/pages/Editor/utils/ids";

import type { DragSource, DropTarget } from "./DragContext";
import { findElementDefinition } from "./elementCatalog";
import { buildPageForTemplate } from "./initialData";
import type { PageData, PageRow, Selection, Viewport } from "./types";

const STORAGE_PREFIX = "flodesk-draw:editor:";
const HISTORY_LIMIT = 100;
const DEBOUNCE_MERGE_MS = 600;

interface HistoryStack {
  past: PageData[];
  present: PageData;
  future: PageData[];
}

interface EditorState {
  history: HistoryStack;
  selection: Selection;
  viewport: Viewport;
  isElementMenuOpen: boolean;
  lastCommitKey: string | null;
  lastCommitAt: number;
}

type Action =
  | { type: "COMMIT"; payload: PageData; debounceKey?: string }
  | { type: "RESET"; payload: PageData }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SELECT"; payload: Selection }
  | { type: "SET_VIEWPORT"; payload: Viewport }
  | { type: "TOGGLE_MENU"; payload?: boolean };

const cloneRow = (r: PageRow): PageRow => ({
  ...r,
  id: createId("row"),
  columnWidths: [...r.columnWidths],
  columns: r.columns.map((col) =>
    col.map((el) => ({ ...el, id: createId("el") }))
  ),
});

const reducer = (state: EditorState, action: Action): EditorState => {
  switch (action.type) {
    case "COMMIT": {
      const now = Date.now();
      const same =
        action.debounceKey &&
        action.debounceKey === state.lastCommitKey &&
        now - state.lastCommitAt < DEBOUNCE_MERGE_MS;
      const past = same
        ? state.history.past
        : [...state.history.past, state.history.present].slice(-HISTORY_LIMIT);
      return {
        ...state,
        history: {
          past,
          present: action.payload,
          future: [],
        },
        lastCommitKey: action.debounceKey ?? null,
        lastCommitAt: now,
      };
    }
    case "RESET":
      return {
        ...state,
        history: { past: [], present: action.payload, future: [] },
        selection: null,
        lastCommitKey: null,
        lastCommitAt: 0,
      };
    case "UNDO": {
      if (state.history.past.length === 0) return state;
      const prev = state.history.past[state.history.past.length - 1];
      return {
        ...state,
        history: {
          past: state.history.past.slice(0, -1),
          present: prev,
          future: [state.history.present, ...state.history.future],
        },
        lastCommitKey: null,
      };
    }
    case "REDO": {
      if (state.history.future.length === 0) return state;
      const [next, ...rest] = state.history.future;
      return {
        ...state,
        history: {
          past: [...state.history.past, state.history.present],
          present: next,
          future: rest,
        },
        lastCommitKey: null,
      };
    }
    case "SELECT":
      return { ...state, selection: action.payload };
    case "SET_VIEWPORT":
      return { ...state, viewport: action.payload };
    case "TOGGLE_MENU":
      return {
        ...state,
        isElementMenuOpen:
          typeof action.payload === "boolean"
            ? action.payload
            : !state.isElementMenuOpen,
      };
    default:
      return state;
  }
};

const replaceRow = (
  page: PageData,
  rowId: string,
  patch: (row: PageRow) => PageRow
): PageData => ({
  ...page,
  rows: page.rows.map((r) => (r.id === rowId ? patch(r) : r)),
});

const replaceElement = (
  page: PageData,
  rowId: string,
  elementId: string,
  patch: (el: PageElement) => PageElement
): PageData =>
  replaceRow(page, rowId, (row) => ({
    ...row,
    columns: row.columns.map((col) =>
      col.map((el) => (el.id === elementId ? patch(el) : el))
    ),
  }));

const newEmptyColumns = (count: number): PageElement[][] =>
  Array.from({ length: count }, () => []);

const evenWidths = (count: number): number[] =>
  Array.from({ length: count }, () => 1);

const insertAt = <T,>(arr: T[], item: T, index: number): T[] => [
  ...arr.slice(0, index),
  item,
  ...arr.slice(index),
];

const move = <T,>(arr: T[], from: number, to: number): T[] => {
  if (from === to || from < 0 || from >= arr.length) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

interface EditorActions {
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
  deleteElement: (rowId: string, elementId: string) => void;
  moveElement: (source: DragSource, target: DropTarget) => void;
  setSelection: (sel: Selection) => void;
  setViewport: (v: Viewport) => void;
  toggleMenu: (open?: boolean) => void;
  undo: () => void;
  redo: () => void;
  resetTo: (page: PageData) => void;
  saveToStorage: () => void;
}

interface EditorContextValue extends EditorActions {
  page: PageData;
  canUndo: boolean;
  canRedo: boolean;
  selection: Selection;
  viewport: Viewport;
  isElementMenuOpen: boolean;
  templateId?: string;
}

const EditorCtx = createContext<EditorContextValue | null>(null);

const storageKey = (templateId?: string) =>
  `${STORAGE_PREFIX}${templateId ?? "blank"}`;

const loadFromStorage = (templateId?: string): PageData | null => {
  try {
    const raw = localStorage.getItem(storageKey(templateId));
    if (!raw) return null;
    return JSON.parse(raw) as PageData;
  } catch {
    return null;
  }
};

interface ProviderProps {
  templateId?: string;
  children: React.ReactNode;
}

export const EditorProvider = ({ templateId, children }: ProviderProps) => {
  const initial = useMemo<PageData>(() => {
    const saved = loadFromStorage(templateId);
    if (saved) return saved;
    return buildPageForTemplate(templateId);
  }, [templateId]);

  const [state, dispatch] = useReducer(reducer, {
    history: { past: [], present: initial, future: [] },
    selection: null,
    viewport: "desktop",
    isElementMenuOpen: true,
    lastCommitKey: null,
    lastCommitAt: 0,
  });

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const commit = useCallback(
    (next: PageData, debounceKey?: string) => {
      dispatch({ type: "COMMIT", payload: next, debounceKey });
    },
    [dispatch]
  );

  const updatePage = useCallback(
    (patch: Partial<PageData>, debounceKey?: string) => {
      const current = stateRef.current.history.present;
      commit({ ...current, ...patch }, debounceKey);
    },
    [commit]
  );

  const updateRow = useCallback(
    (rowId: string, patch: Partial<PageRow>, debounceKey?: string) => {
      const current = stateRef.current.history.present;
      commit(
        replaceRow(current, rowId, (r) => ({ ...r, ...patch })),
        debounceKey
      );
    },
    [commit]
  );

  const setRowColumnsCount = useCallback(
    (rowId: string, count: 1 | 2 | 3 | 4) => {
      const current = stateRef.current.history.present;
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
    [commit]
  );

  const setColumnWidth = useCallback(
    (rowId: string, index: number, width: number) => {
      const current = stateRef.current.history.present;
      const next = replaceRow(current, rowId, (row) => {
        const widths = [...row.columnWidths];
        widths[index] = Math.max(0.1, width);
        return { ...row, columnWidths: widths };
      });
      commit(next, `col-width-${rowId}-${index}`);
    },
    [commit]
  );

  const updateElement = useCallback(
    <T extends PageElement>(
      rowId: string,
      elementId: string,
      patch: Partial<T>,
      debounceKey?: string
    ) => {
      const current = stateRef.current.history.present;
      commit(
        replaceElement(current, rowId, elementId, (el) => ({
          ...el,
          ...patch,
        })),
        debounceKey
      );
    },
    [commit]
  );

  const addRowAt = useCallback(
    (index: number) => {
      const current = stateRef.current.history.present;
      const newRow: PageRow = {
        id: createId("row"),
        backgroundColor: "transparent",
        paddingX: 64,
        paddingY: 40,
        marginY: 0,
        columnsCount: 1,
        columnWidths: [1],
        columnGap: 24,
        columns: newEmptyColumns(1),
      };
      commit({ ...current, rows: insertAt(current.rows, newRow, index) });
      dispatch({ type: "SELECT", payload: { kind: "row", rowId: newRow.id } });
    },
    [commit]
  );

  const moveRow = useCallback(
    (fromIndex: number, toIndex: number) => {
      const current = stateRef.current.history.present;
      commit({ ...current, rows: move(current.rows, fromIndex, toIndex) });
    },
    [commit]
  );

  const duplicateRow = useCallback(
    (rowId: string) => {
      const current = stateRef.current.history.present;
      const index = current.rows.findIndex((r) => r.id === rowId);
      if (index < 0) return;
      const dup = cloneRow(current.rows[index]);
      commit({ ...current, rows: insertAt(current.rows, dup, index + 1) });
      dispatch({ type: "SELECT", payload: { kind: "row", rowId: dup.id } });
    },
    [commit]
  );

  const deleteRow = useCallback(
    (rowId: string) => {
      const current = stateRef.current.history.present;
      commit({
        ...current,
        rows: current.rows.filter((r) => r.id !== rowId),
      });
      dispatch({ type: "SELECT", payload: null });
    },
    [commit]
  );

  const addElement = useCallback(
    (
      rowId: string,
      columnIndex: number,
      type: ElementType,
      insertIndex?: number
    ) => {
      const def = findElementDefinition(type);
      if (!def) return;
      const current = stateRef.current.history.present;
      const newEl = def.create();
      const next = replaceRow(current, rowId, (row) => {
        const columns = row.columns.map((col, i) => {
          if (i !== columnIndex) return col;
          const at = insertIndex ?? col.length;
          return insertAt(col, newEl, at);
        });
        return { ...row, columns };
      });
      commit(next);
      dispatch({
        type: "SELECT",
        payload: {
          kind: "element",
          rowId,
          columnIndex,
          elementId: newEl.id,
        },
      });
    },
    [commit]
  );

  const addRowWithElement = useCallback(
    (type: ElementType) => {
      const def = findElementDefinition(type);
      if (!def) return;
      const current = stateRef.current.history.present;
      const newEl = def.create();
      const newRow: PageRow = {
        id: createId("row"),
        backgroundColor: "transparent",
        paddingX: 64,
        paddingY: 40,
        marginY: 0,
        columnsCount: 1,
        columnWidths: [1],
        columnGap: 24,
        columns: [[newEl]],
      };
      commit({ ...current, rows: [...current.rows, newRow] });
      dispatch({
        type: "SELECT",
        payload: {
          kind: "element",
          rowId: newRow.id,
          columnIndex: 0,
          elementId: newEl.id,
        },
      });
    },
    [commit]
  );

  const deleteElement = useCallback(
    (rowId: string, elementId: string) => {
      const current = stateRef.current.history.present;
      const next = replaceRow(current, rowId, (row) => ({
        ...row,
        columns: row.columns.map((col) =>
          col.filter((el) => el.id !== elementId)
        ),
      }));
      commit(next);
      dispatch({ type: "SELECT", payload: { kind: "row", rowId } });
    },
    [commit]
  );

  const moveElement = useCallback(
    (source: DragSource, target: DropTarget) => {
      const current = stateRef.current.history.present;
      const srcRow = current.rows.find((r) => r.id === source.rowId);
      if (!srcRow) return;
      const srcCol = srcRow.columns[source.columnIndex];
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
          if (row.id === source.rowId && isSameColumn && idx === source.columnIndex) {
            const without = next.filter((el) => el.id !== source.elementId);
            return insertAt(without, element, adjustedInsert);
          }
          if (row.id === target.rowId && idx === target.columnIndex && !isSameColumn) {
            return insertAt(next, element, adjustedInsert);
          }
          return next;
        });
        return { ...row, columns };
      });

      commit({ ...current, rows: nextRows });
      dispatch({
        type: "SELECT",
        payload: {
          kind: "element",
          rowId: target.rowId,
          columnIndex: target.columnIndex,
          elementId: element.id,
        },
      });
    },
    [commit]
  );

  const setSelection = useCallback(
    (sel: Selection) => dispatch({ type: "SELECT", payload: sel }),
    []
  );

  const setViewport = useCallback(
    (v: Viewport) => dispatch({ type: "SET_VIEWPORT", payload: v }),
    []
  );

  const toggleMenu = useCallback(
    (open?: boolean) => dispatch({ type: "TOGGLE_MENU", payload: open }),
    []
  );

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  const resetTo = useCallback(
    (page: PageData) => dispatch({ type: "RESET", payload: page }),
    []
  );

  const saveToStorage = useCallback(() => {
    try {
      localStorage.setItem(
        storageKey(templateId),
        JSON.stringify(stateRef.current.history.present)
      );
    } catch {
      // ignore
    }
  }, [templateId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey(templateId),
        JSON.stringify(state.history.present)
      );
    } catch {
      // ignore
    }
  }, [state.history.present, templateId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditableTarget =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (isEditableTarget) return;
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      const key = e.key.toLowerCase();
      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        dispatch({ type: "UNDO" });
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        dispatch({ type: "REDO" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const value = useMemo<EditorContextValue>(
    () => ({
      page: state.history.present,
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
      selection: state.selection,
      viewport: state.viewport,
      isElementMenuOpen: state.isElementMenuOpen,
      templateId,
      updatePage,
      updateRow,
      setRowColumnsCount,
      setColumnWidth,
      updateElement,
      addRowAt,
      moveRow,
      duplicateRow,
      deleteRow,
      addElement,
      addRowWithElement,
      deleteElement,
      moveElement,
      setSelection,
      setViewport,
      toggleMenu,
      undo,
      redo,
      resetTo,
      saveToStorage,
    }),
    [
      state.history.present,
      state.history.past.length,
      state.history.future.length,
      state.selection,
      state.viewport,
      state.isElementMenuOpen,
      templateId,
      updatePage,
      updateRow,
      setRowColumnsCount,
      setColumnWidth,
      updateElement,
      addRowAt,
      moveRow,
      duplicateRow,
      deleteRow,
      addElement,
      addRowWithElement,
      deleteElement,
      moveElement,
      setSelection,
      setViewport,
      toggleMenu,
      undo,
      redo,
      resetTo,
      saveToStorage,
    ]
  );

  return <EditorCtx.Provider value={value}>{children}</EditorCtx.Provider>;
};

export const useEditor = (): EditorContextValue => {
  const ctx = useContext(EditorCtx);
  if (!ctx) throw new Error("useEditor must be used within EditorProvider");
  return ctx;
};
