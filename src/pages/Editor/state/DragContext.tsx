/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type DragKind = "new-element" | "existing-element" | null;

export interface DropTarget {
  rowId: string;
  columnIndex: number;
  insertIndex: number;
}

export interface DragSource {
  rowId: string;
  columnIndex: number;
  elementId: string;
}

interface DragContextValue {
  dragKind: DragKind;
  source: DragSource | null;
  dropTarget: DropTarget | null;
  beginDrag: (
    kind: Exclude<DragKind, null>,
    source?: DragSource | null
  ) => void;
  endDrag: () => void;
  setDropTarget: (t: DropTarget | null) => void;
}

const DragCtx = createContext<DragContextValue | null>(null);

interface ProviderProps {
  children: React.ReactNode;
}

export const DragProvider = ({ children }: ProviderProps) => {
  const [dragKind, setDragKind] = useState<DragKind>(null);
  const [source, setSource] = useState<DragSource | null>(null);
  const [dropTarget, setDropTargetState] = useState<DropTarget | null>(null);

  const beginDrag = useCallback(
    (kind: Exclude<DragKind, null>, src?: DragSource | null) => {
      setDragKind(kind);
      setSource(src ?? null);
      setDropTargetState(null);
    },
    []
  );

  const endDrag = useCallback(() => {
    setDragKind(null);
    setSource(null);
    setDropTargetState(null);
  }, []);

  const setDropTarget = useCallback((t: DropTarget | null) => {
    setDropTargetState(t);
  }, []);

  const value = useMemo<DragContextValue>(
    () => ({
      dragKind,
      source,
      dropTarget,
      beginDrag,
      endDrag,
      setDropTarget,
    }),
    [dragKind, source, dropTarget, beginDrag, endDrag, setDropTarget]
  );

  return <DragCtx.Provider value={value}>{children}</DragCtx.Provider>;
};

export const useDrag = (): DragContextValue => {
  const ctx = useContext(DragCtx);
  if (!ctx) throw new Error("useDrag must be used within DragProvider");
  return ctx;
};
