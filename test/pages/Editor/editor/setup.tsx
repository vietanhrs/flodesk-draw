/* eslint-disable react-refresh/only-export-components */

import { screen } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import { afterEach, beforeEach, vi } from "vitest";

const originalMatchMedia = window.matchMedia;

export const setEditorChromeMedia = (matches: boolean) => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === "(max-width: 767px)" ? matches : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

beforeEach(() => {
  // Defensive: tests no longer depend on localStorage (page state lives in
  // memory + `.flodesk` files now), but clearing keeps any unrelated test
  // suites or future regressions from leaking state between cases.
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: originalMatchMedia,
  });
});

/**
 * The CanvasRow's inner `<div>` is the draggable, has aria-label "Row N",
 * carries the row's inline styles, and is wrapped by an outer `.edt-row` that
 * holds the drop handlers.
 */
export const getRowInner = (n: number): HTMLElement =>
  screen.getByLabelText(`Row ${n}`);

export const getRowOuter = (n: number): HTMLElement => {
  const outer = getRowInner(n).closest(".edt-row");
  if (!(outer instanceof HTMLElement))
    throw new Error(`Could not find .edt-row wrapper for Row ${n}`);
  return outer;
};

export const getCanvasPaper = (container: HTMLElement): HTMLElement => {
  // The viewport-aware canvas paper is the only div whose inline style sets
  // an explicit max-width (either 1080 for desktop or 390 for mobile).
  const paper = container.querySelector<HTMLElement>('div[style*="max-width"]');
  if (!paper) throw new Error("Canvas paper not found");
  return paper;
};

export const RouteSwitchControls = () => {
  const navigate = useNavigate();

  return (
    <nav aria-label="Editor route test controls">
      <button
        type="button"
        onClick={() => void navigate("/templates/bold-sale-announcement")}
      >
        Load sale template
      </button>
      <button
        type="button"
        onClick={() => void navigate("/templates/welcome-to-the-family")}
      >
        Load welcome template
      </button>
    </nav>
  );
};
