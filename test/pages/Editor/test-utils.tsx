/* eslint-disable react-refresh/only-export-components */
import { GrainProvider } from "@flodesk/grain";
import { fireEvent, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import { Editor } from "@src/pages/Editor";

const LocationDisplay = () => {
  const location = useLocation();
  return (
    <div data-testid="location" data-pathname={location.pathname}>
      {`${location.pathname}${location.search}`}
    </div>
  );
};

/**
 * Mount the Editor at either `/editor` (blank) or `/templates/:templateId`
 * depending on whether a templateId is given. The Editor route component reads
 * `useParams().templateId` so we need a real Routes entry for it.
 */
export const renderEditor = (templateId?: string) => {
  const initialPath = templateId ? `/templates/${templateId}` : "/editor";
  return render(
    <GrainProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <LocationDisplay />
        <Routes>
          <Route path="/editor" element={<Editor />} />
          <Route path="/templates/:templateId" element={<Editor />} />
          <Route path="*" element={null} />
        </Routes>
      </MemoryRouter>
    </GrainProvider>
  );
};

/**
 * jsdom doesn't ship a real `DataTransfer`. fireEvent.drag* lets us pass a
 * `dataTransfer` in eventInit; this stand-in implements just enough of the
 * surface used by the editor's drag helpers (setData/getData/types).
 */
export class FakeDataTransfer {
  private store: Record<string, string> = {};
  public effectAllowed = "";
  public dropEffect = "";
  public files: File[] = [];

  get types(): string[] {
    return Object.keys(this.store);
  }

  setData(type: string, value: string): void {
    this.store[type] = value;
  }

  getData(type: string): string {
    return this.store[type] ?? "";
  }

  clearData(type?: string): void {
    if (type === undefined) {
      this.store = {};
    } else {
      delete this.store[type];
    }
  }

  setDragImage(): void {
    /* no-op */
  }
}

/**
 * The Editor's drag handlers read `e.currentTarget.getBoundingClientRect()`
 * to figure out whether a drop should land above or below the hovered row. In
 * jsdom that always returns zeros — fine for "below the midpoint" (clientY ≥
 * 0) but we need a way to express "above" too. Negative clientY does the job.
 */
export const DROP_BELOW = 10;
export const DROP_ABOVE = -10;

type DragEventKind =
  | "dragstart"
  | "dragend"
  | "dragover"
  | "dragleave"
  | "drop";

/**
 * jsdom's `DragEvent` constructor ignores `dataTransfer` from the init dict, so
 * `fireEvent.dragStart(el, { dataTransfer })` reaches the React handler with
 * `e.dataTransfer === null`. We sidestep that by constructing a base `Event`
 * and pinning the relevant properties on it with `Object.defineProperty`
 * before dispatching.
 */
export const fireDragEvent = (
  type: DragEventKind,
  target: Element,
  init: {
    dataTransfer: FakeDataTransfer;
    clientX?: number;
    clientY?: number;
  }
): void => {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", {
    value: init.dataTransfer,
    enumerable: true,
  });
  if (init.clientX !== undefined) {
    Object.defineProperty(event, "clientX", {
      value: init.clientX,
      enumerable: true,
    });
  }
  if (init.clientY !== undefined) {
    Object.defineProperty(event, "clientY", {
      value: init.clientY,
      enumerable: true,
    });
  }
  fireEvent(target, event);
};
