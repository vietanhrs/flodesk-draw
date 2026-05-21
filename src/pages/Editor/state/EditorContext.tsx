/* eslint-disable react-refresh/only-export-components */

import { type ReactNode, useEffect, useLayoutEffect } from "react";

import { useShallow } from "zustand/react/shallow";

import type { LoadedFile } from "@src/pages/Editor/exporter/flodeskFile";

import {
  initializeEditorStore,
  useEditorStore,
  type EditorActions,
} from "./editorStore";
import type { PageData, Selection, Viewport } from "./types";

interface ProviderProps {
  templateId?: string;
  initialFile?: LoadedFile;
  children: ReactNode;
}

interface EditorContextValue extends EditorActions {
  page: PageData;
  canUndo: boolean;
  canRedo: boolean;
  selection: Selection;
  viewport: Viewport;
  isElementMenuOpen: boolean;
  loadedFile: LoadedFile | null;
}

interface EditorDocumentContextValue {
  page: PageData;
}

interface EditorHistoryContextValue {
  canUndo: boolean;
  canRedo: boolean;
}

// The editor uses a shared Zustand store that is re-seeded per route/file
// session. This keeps the editor API lightweight for the assignment while
// still making session boundaries explicit through the provider keying.
export const EditorProvider = ({
  templateId,
  initialFile,
  children,
}: ProviderProps) => {
  useLayoutEffect(() => {
    initializeEditorStore({ templateId, initialFile });
  }, [templateId, initialFile]);

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
      const { undo, redo } = useEditorStore.getState().actions;

      if (key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((key === "z" && e.shiftKey) || key === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return children;
};

export const useEditor = (): EditorContextValue => ({
  ...useEditorDocument(),
  ...useEditorHistoryState(),
  selection: useEditorSelection(),
  viewport: useEditorViewport(),
  isElementMenuOpen: useEditorMenuState(),
  loadedFile: useEditorLoadedFile(),
  ...useEditorActions(),
});

export const useEditorDocument = (): EditorDocumentContextValue =>
  useEditorStore(useShallow((state) => ({ page: state.history.present })));

export const useEditorHistoryState = (): EditorHistoryContextValue =>
  useEditorStore(
    useShallow((state) => ({
      canUndo: state.history.past.length > 0,
      canRedo: state.history.future.length > 0,
    }))
  );

export const useEditorSelection = (): Selection =>
  useEditorStore((state) => state.selection);

export const useEditorViewport = (): Viewport =>
  useEditorStore((state) => state.viewport);

export const useEditorMenuState = (): boolean =>
  useEditorStore((state) => state.isElementMenuOpen);

export const useEditorLoadedFile = (): LoadedFile | null =>
  useEditorStore((state) => state.loadedFile);

export const useEditorActions = (): EditorActions =>
  useEditorStore((state) => state.actions);
