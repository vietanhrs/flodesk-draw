import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { LoadedFile } from "@src/pages/Editor/exporter/flodeskFile";
import { createEmptyPage } from "@src/pages/Editor/state/initialData";

import {
  DROP_ABOVE,
  DROP_BELOW,
  FakeDataTransfer,
  fireDragEvent,
  renderEditor,
} from "./test-utils";

const originalMatchMedia = window.matchMedia;

const setEditorChromeMedia = (matches: boolean) => {
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
const getRowInner = (n: number): HTMLElement =>
  screen.getByLabelText(`Row ${n}`);

const getRowOuter = (n: number): HTMLElement => {
  const outer = getRowInner(n).closest(".edt-row");
  if (!(outer instanceof HTMLElement))
    throw new Error(`Could not find .edt-row wrapper for Row ${n}`);
  return outer;
};

const getCanvasPaper = (container: HTMLElement): HTMLElement => {
  // The viewport-aware canvas paper is the only div whose inline style sets
  // an explicit max-width (either 1080 for desktop or 390 for mobile).
  const paper = container.querySelector<HTMLElement>('div[style*="max-width"]');
  if (!paper) throw new Error("Canvas paper not found");
  return paper;
};

const RouteSwitchControls = () => {
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

describe("Editor — template loading", () => {
  it("loads the canvas data for a known templateId", () => {
    renderEditor("bold-sale-announcement");

    // Two rows live on this template (bold-sale-announcement in initialData).
    expect(screen.getByLabelText("Row 1")).toBeInTheDocument();
    expect(screen.getByLabelText("Row 2")).toBeInTheDocument();
    expect(screen.queryByLabelText("Row 3")).not.toBeInTheDocument();

    // Content from the template comes through unchanged.
    expect(
      within(getRowInner(1)).getByText("BLACK FRIDAY")
    ).toBeInTheDocument();
    expect(within(getRowInner(1)).getByText("70% OFF")).toBeInTheDocument();
    expect(
      within(getRowInner(1)).getByText(/Our biggest sale of the year/)
    ).toBeInTheDocument();
    expect(
      within(getRowInner(2)).getByText("Use code BLACK70 at checkout")
    ).toBeInTheDocument();
  });

  it("falls back to the blank empty page when no templateId is given", () => {
    renderEditor();

    // createEmptyPage seeds one row with these elements:
    expect(screen.getByText("Build something beautiful")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Drop elements from the menu on the left to start your page\./
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Get started")).toBeInTheDocument();
  });

  it("resets page state and history when switching template routes", async () => {
    const user = userEvent.setup();
    renderEditor({
      templateId: "bold-sale-announcement",
      routeControls: <RouteSwitchControls />,
    });

    const hex = screen.getByLabelText("Background value");
    await user.clear(hex);
    await user.type(hex, "#abcdef");
    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();

    await user.click(
      screen.getByRole("button", { name: "Load welcome template" })
    );

    await screen.findByText("Hello, lovely friend.");
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/templates/welcome-to-the-family"
    );
    expect(screen.queryByText("70% OFF")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
  });

  it("clears loaded-file state when switching from a file route to a template route", async () => {
    const user = userEvent.setup();
    const loadedFile: LoadedFile = {
      name: "route-draft",
      page: createEmptyPage(),
    };

    renderEditor({
      initialFile: loadedFile,
      routeControls: <RouteSwitchControls />,
    });

    expect(screen.getByLabelText("Current file")).toHaveTextContent(
      "route-draft"
    );
    expect(screen.getByText("Build something beautiful")).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Load welcome template" })
    );

    await screen.findByText("Hello, lovely friend.");
    expect(screen.queryByLabelText("Current file")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Build something beautiful")
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });
});

describe("Editor — row operations", () => {
  it("moves a row up and down via the floating menu", () => {
    renderEditor("bold-sale-announcement");

    // Selecting Row 2 reveals its floating action menu (chrome only shows when
    // a row is selected or contains the selection).
    fireEvent.click(getRowInner(2));

    fireEvent.click(screen.getByRole("button", { name: "Move row up" }));

    // After the up-move, the content previously in Row 2 should now be in Row 1.
    expect(
      within(getRowInner(1)).getByText("Use code BLACK70 at checkout")
    ).toBeInTheDocument();
    expect(
      within(getRowInner(2)).getByText("BLACK FRIDAY")
    ).toBeInTheDocument();

    // Re-select the moved row and push it back down.
    fireEvent.click(getRowInner(1));
    fireEvent.click(screen.getByRole("button", { name: "Move row down" }));

    expect(
      within(getRowInner(1)).getByText("BLACK FRIDAY")
    ).toBeInTheDocument();
    expect(
      within(getRowInner(2)).getByText("Use code BLACK70 at checkout")
    ).toBeInTheDocument();
  });

  it("duplicates the selected row", () => {
    renderEditor("bold-sale-announcement");

    fireEvent.click(getRowInner(1));
    fireEvent.click(screen.getByRole("button", { name: "Duplicate row" }));

    // A duplicate is inserted immediately after the source row, so we should
    // now have a third row and Row 2 should mirror Row 1's content.
    expect(screen.getByLabelText("Row 3")).toBeInTheDocument();
    expect(
      within(getRowInner(1)).getByText("BLACK FRIDAY")
    ).toBeInTheDocument();
    expect(
      within(getRowInner(2)).getByText("BLACK FRIDAY")
    ).toBeInTheDocument();
    expect(within(getRowInner(2)).getByText("70% OFF")).toBeInTheDocument();
  });

  it("deletes the selected row", () => {
    renderEditor("bold-sale-announcement");

    fireEvent.click(getRowInner(1));
    fireEvent.click(screen.getByRole("button", { name: "Delete row" }));

    // Row 1 is gone; only the original Row 2 remains, re-indexed as Row 1.
    expect(screen.queryByLabelText("Row 2")).not.toBeInTheDocument();
    expect(
      within(getRowInner(1)).getByText("Use code BLACK70 at checkout")
    ).toBeInTheDocument();
    expect(screen.queryByText("BLACK FRIDAY")).not.toBeInTheDocument();
  });

  it("reorders rows via drag and drop", () => {
    renderEditor("bold-sale-announcement");

    const dt = new FakeDataTransfer();
    fireDragEvent("dragstart", getRowInner(1), { dataTransfer: dt });
    fireDragEvent("dragover", getRowOuter(2), {
      dataTransfer: dt,
      clientY: DROP_BELOW,
    });
    fireDragEvent("drop", getRowOuter(2), {
      dataTransfer: dt,
      clientY: DROP_BELOW,
    });

    // Drag Row 1 below the midpoint of Row 2 → Row 1 should now sit at the
    // bottom. The Canvas handler subtracts one from toIndex when moving
    // forward, so the new order is [originalRow2, originalRow1].
    expect(
      within(getRowInner(1)).getByText("Use code BLACK70 at checkout")
    ).toBeInTheDocument();
    expect(
      within(getRowInner(2)).getByText("BLACK FRIDAY")
    ).toBeInTheDocument();
  });

  it("drag-drops above the midpoint to place the dragged row before the target", () => {
    renderEditor("bold-sale-announcement");

    const dt = new FakeDataTransfer();
    fireDragEvent("dragstart", getRowInner(2), { dataTransfer: dt });
    fireDragEvent("dragover", getRowOuter(1), {
      dataTransfer: dt,
      clientY: DROP_ABOVE,
    });
    fireDragEvent("drop", getRowOuter(1), {
      dataTransfer: dt,
      clientY: DROP_ABOVE,
    });

    expect(
      within(getRowInner(1)).getByText("Use code BLACK70 at checkout")
    ).toBeInTheDocument();
    expect(
      within(getRowInner(2)).getByText("BLACK FRIDAY")
    ).toBeInTheDocument();
  });

  it("adds a new row by clicking the plus button on an existing row", () => {
    renderEditor("bold-sale-announcement");

    // Reveal the AddRowButtons by selecting a row (chrome is gated on
    // selection/hover, and selection is more reliable in jsdom).
    fireEvent.click(getRowInner(1));
    fireEvent.click(screen.getByRole("button", { name: "Add row below" }));

    expect(screen.getByLabelText("Row 3")).toBeInTheDocument();
    // The new row keeps the original Row 1 in place and pushes the rest down.
    expect(
      within(getRowInner(1)).getByText("BLACK FRIDAY")
    ).toBeInTheDocument();
    expect(
      within(getRowInner(3)).getByText("Use code BLACK70 at checkout")
    ).toBeInTheDocument();
  });
});

describe("Editor — element floating menu", () => {
  /**
   * Select an element by clicking its `.edt-element` wrapper. Returns the
   * wrapper so individual tests can reuse it for follow-up assertions.
   */
  const selectElementByH1 = (container: HTMLElement): HTMLElement => {
    const heading = container.querySelector("h1");
    if (!heading) throw new Error("expected an h1 in the canvas");
    const wrapper = heading.closest(".edt-element");
    if (!(wrapper instanceof HTMLElement))
      throw new Error("expected an .edt-element wrapper around the h1");
    fireEvent.click(wrapper);
    return wrapper;
  };

  it("shows the floating menu only while an element is selected", () => {
    const { container } = renderEditor("bold-sale-announcement");

    // Before selection: no element toolbar in the DOM.
    expect(
      screen.queryByRole("toolbar", { name: "Element actions" })
    ).not.toBeInTheDocument();

    selectElementByH1(container);

    // After selection: the toolbar appears with all four actions.
    const toolbar = screen.getByRole("toolbar", { name: "Element actions" });
    expect(toolbar).toBeInTheDocument();
    expect(
      within(toolbar).getByRole("button", { name: "Move element up" })
    ).toBeInTheDocument();
    expect(
      within(toolbar).getByRole("button", { name: "Move element down" })
    ).toBeInTheDocument();
    expect(
      within(toolbar).getByRole("button", { name: "Duplicate element" })
    ).toBeInTheDocument();
    expect(
      within(toolbar).getByRole("button", { name: "Delete element" })
    ).toBeInTheDocument();

    // Deselect by clicking the canvas background.
    fireEvent.click(screen.getByTestId("editor-canvas").parentElement!);
    expect(
      screen.queryByRole("toolbar", { name: "Element actions" })
    ).not.toBeInTheDocument();
  });

  it("moves the selected element up and down within its column", () => {
    const { container } = renderEditor("bold-sale-announcement");

    // Row 1 column elements: [BLACK FRIDAY (p), 70% OFF (h1), "Our biggest…",
    // spacer, "Shop the sale"]. Select the h1 (index 1).
    selectElementByH1(container);

    const column = container.querySelector<HTMLElement>(
      '[data-testid="canvas-column-1-1"]'
    );
    if (!column) throw new Error("expected row 1 column 1");

    // Move down → h1 should now be the third .edt-element.
    fireEvent.click(screen.getByRole("button", { name: "Move element down" }));
    expect(
      column.querySelectorAll(".edt-element")[2].querySelector("h1")
        ?.textContent
    ).toBe("70% OFF");

    // Move up twice → h1 should now be the first .edt-element.
    fireEvent.click(screen.getByRole("button", { name: "Move element up" }));
    fireEvent.click(screen.getByRole("button", { name: "Move element up" }));
    expect(
      column.querySelectorAll(".edt-element")[0].querySelector("h1")
        ?.textContent
    ).toBe("70% OFF");
  });

  it("disables Move element up on the first element and Move element down on the last", () => {
    const { container } = renderEditor("bold-sale-announcement");

    const column = container.querySelector<HTMLElement>(
      '[data-testid="canvas-column-1-1"]'
    );
    if (!column) throw new Error("expected row 1 column 1");
    const elements = column.querySelectorAll(".edt-element");
    const firstWrapper = elements[0] as HTMLElement; // "BLACK FRIDAY" paragraph
    const lastWrapper = elements[elements.length - 1] as HTMLElement; // "Shop the sale" button

    fireEvent.click(firstWrapper);
    expect(
      screen.getByRole("button", { name: "Move element up" })
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move element down" })
    ).toBeEnabled();

    fireEvent.click(lastWrapper);
    expect(
      screen.getByRole("button", { name: "Move element up" })
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "Move element down" })
    ).toBeDisabled();
  });

  it("duplicates the selected element and selects the clone", () => {
    const { container } = renderEditor("bold-sale-announcement");

    selectElementByH1(container);

    const column = container.querySelector<HTMLElement>(
      '[data-testid="canvas-column-1-1"]'
    );
    if (!column) throw new Error("expected row 1 column 1");
    const beforeCount = column.querySelectorAll(".edt-element").length;

    fireEvent.click(screen.getByRole("button", { name: "Duplicate element" }));

    // One more .edt-element child; two h1s now (original + clone).
    expect(column.querySelectorAll(".edt-element").length).toBe(
      beforeCount + 1
    );
    expect(column.querySelectorAll("h1").length).toBe(2);

    // The clone is auto-selected — toolbar still visible and the second h1's
    // wrapper carries the selected class.
    const headings = column.querySelectorAll("h1");
    const cloneWrapper = headings[1].closest(".edt-element");
    expect(cloneWrapper?.classList.contains("edt-element--selected")).toBe(
      true
    );
  });

  it("deletes the selected element and hides the floating menu", () => {
    const { container } = renderEditor("bold-sale-announcement");

    selectElementByH1(container);

    fireEvent.click(screen.getByRole("button", { name: "Delete element" }));

    // The h1 (70% OFF) is gone; the element toolbar disappears with it.
    expect(container.querySelector("h1")).toBeNull();
    expect(
      screen.queryByRole("toolbar", { name: "Element actions" })
    ).not.toBeInTheDocument();
  });
});

describe("Editor — element menu", () => {
  // "Layout" appears as both an element category button and a config-pane tab
  // button, so we narrow category lookups to the element-menu aside.
  const getCategoryButton = (label: string) =>
    within(screen.getByLabelText("Element menu")).getByRole("button", {
      name: label,
    });

  it("renders every element category and shows only the active category's elements", async () => {
    const user = userEvent.setup();
    renderEditor();

    // Every category is rendered as a clickable button inside the element menu.
    for (const label of ["Text", "Media", "Buttons", "Layout", "Social"]) {
      expect(getCategoryButton(label)).toBeInTheDocument();
    }

    // The first category ("Text") is selected by default.
    expect(getCategoryButton("Text")).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("button", { name: "Drag to add Heading" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Drag to add Paragraph" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Drag to add Quote" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Drag to add Image" })
    ).not.toBeInTheDocument();

    // Click "Media" → the card list swaps to Media-category elements.
    await user.click(getCategoryButton("Media"));

    expect(
      screen.getByRole("button", { name: "Drag to add Image" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Drag to add Video" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Drag to add Heading" })
    ).not.toBeInTheDocument();

    // Click "Layout" → Divider + Spacer.
    await user.click(getCategoryButton("Layout"));
    expect(
      screen.getByRole("button", { name: "Drag to add Divider" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Drag to add Spacer" })
    ).toBeInTheDocument();
  });

  it("filters elements by the search query across all categories", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Search" }));
    const searchInput = screen.getByLabelText("Search elements");

    await user.type(searchInput, "head");

    // "head" matches "Heading" — every other element disappears.
    expect(
      screen.getByRole("button", { name: "Drag to add Heading" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Drag to add Paragraph" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Drag to add Image" })
    ).not.toBeInTheDocument();

    // While searching, no category is highlighted as active.
    expect(getCategoryButton("Text")).not.toHaveAttribute(
      "aria-current",
      "page"
    );

    // A query with no matches surfaces the empty state.
    await user.clear(searchInput);
    await user.type(searchInput, "zzzzz");
    expect(screen.getByText("No elements match.")).toBeInTheDocument();
  });

  it("opens, clears, and collapses the element search", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.click(screen.getByRole("button", { name: "Search" }));

    const searchInput = screen.getByLabelText("Search elements");
    const searchRoot = searchInput.closest(".edt-search");
    if (!searchRoot) throw new Error("expected search root to be present");

    expect(searchInput).toHaveFocus();
    expect(searchRoot).toHaveClass("edt-search--open");
    expect(screen.queryByRole("button", { name: "Search" })).toBeNull();

    await user.type(searchInput, "image");

    expect(searchInput).toHaveValue("image");
    expect(
      screen.getByRole("button", { name: "Clear search" })
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(searchInput).toHaveValue("");
    expect(searchRoot).toHaveClass("edt-search--open");

    fireEvent.blur(searchInput);

    expect(searchRoot).not.toHaveClass("edt-search--open");
    expect(
      screen.queryByRole("textbox", { name: "Search elements" })
    ).toBeNull();
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("drops a new element into an existing column on the canvas", async () => {
    const user = userEvent.setup();
    const { container } = renderEditor("bold-sale-announcement");

    // The "Divider" card lives in the Layout category — switch to it first.
    await user.click(getCategoryButton("Layout"));

    // The CanvasRow column is the inner drop zone for new elements; pick the
    // first one (Row 1, Column 0).
    const column = container.querySelector<HTMLElement>(".edt-column");
    if (!column) throw new Error("expected a canvas column to be present");

    const dividerCard = screen.getByRole("button", {
      name: "Drag to add Divider",
    });

    const dt = new FakeDataTransfer();
    fireDragEvent("dragstart", dividerCard, { dataTransfer: dt });
    fireDragEvent("dragover", column, { dataTransfer: dt });
    fireDragEvent("drop", column, { dataTransfer: dt });

    // The dropped element is auto-selected, which switches the config pane to
    // the Element tab — its "Thickness" field confirms a divider was added.
    expect(screen.getByLabelText("Thickness")).toBeInTheDocument();
    expect(screen.getByLabelText("Thickness slider")).toBeInTheDocument();

    // The divider also renders into the canvas as an <hr>.
    expect(container.querySelectorAll("hr").length).toBeGreaterThan(0);
  });

  it("adds a menu element from the keyboard", () => {
    renderEditor();

    expect(screen.queryByLabelText("Row 2")).not.toBeInTheDocument();

    const headingCard = screen.getByRole("button", {
      name: "Drag to add Heading",
    });
    headingCard.focus();
    fireEvent.keyDown(headingCard, { key: "Enter" });

    expect(screen.getByLabelText("Row 2")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Heading" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Text")).toHaveValue("Headline text");
  });

  it("drops a new element into the top of an existing column when the cursor is above all children", async () => {
    const user = userEvent.setup();
    const { container } = renderEditor("bold-sale-announcement");

    await user.click(getCategoryButton("Layout"));

    const column = container.querySelector<HTMLElement>(".edt-column");
    if (!column) throw new Error("expected a canvas column to be present");
    // jsdom returns zero-rects for every child, so getBoundingClientRect().top
    // and rect.height / 2 are both 0. A negative clientY (-10) makes
    // computeInsertIndex pick index 0 (top) on the very first child.
    const childCountBefore = column.children.length;

    const dividerCard = screen.getByRole("button", {
      name: "Drag to add Divider",
    });

    const dt = new FakeDataTransfer();
    fireDragEvent("dragstart", dividerCard, { dataTransfer: dt });
    fireDragEvent("dragover", column, { dataTransfer: dt, clientY: -10 });
    fireDragEvent("drop", column, { dataTransfer: dt, clientY: -10 });

    // The new divider is the first child of the column. The original first
    // child was a paragraph with "BLACK FRIDAY"; now an <hr> precedes it.
    expect(column.children.length).toBe(childCountBefore + 1);
    const firstChild = column.children[0] as HTMLElement;
    expect(firstChild.querySelector("hr")).toBeTruthy();
  });

  it("reorders elements within a column via drag and drop", () => {
    const { container } = renderEditor("bold-sale-announcement");

    const row1Column = container.querySelector<HTMLElement>(
      '[data-testid="canvas-column-1-1"]'
    );
    if (!row1Column) throw new Error("expected row 1 column 1");

    // Row 1 elements in order: BLACK FRIDAY (paragraph), 70% OFF (h1),
    // "Our biggest sale…", spacer, Shop the sale (button).
    const headingWrapper = (
      row1Column.querySelector("h1") as HTMLElement
    ).closest(".edt-element") as HTMLElement;
    if (!headingWrapper) throw new Error("expected an h1 wrapper in row 1");

    const dt = new FakeDataTransfer();
    fireDragEvent("dragstart", headingWrapper, { dataTransfer: dt });
    fireDragEvent("dragover", row1Column, { dataTransfer: dt, clientY: -10 });
    fireDragEvent("drop", row1Column, { dataTransfer: dt, clientY: -10 });

    // The h1 (70% OFF) was originally the second child; after dropping with
    // clientY=-10 (top), it should be the first .edt-element child.
    const elementChildren = row1Column.querySelectorAll(".edt-element");
    expect(elementChildren[0].querySelector("h1")?.textContent).toBe("70% OFF");
  });

  it("moves an element to a different row via drag and drop", () => {
    const { container } = renderEditor("bold-sale-announcement");

    const row1Column = container.querySelector<HTMLElement>(
      '[data-testid="canvas-column-1-1"]'
    );
    const row2Column = container.querySelector<HTMLElement>(
      '[data-testid="canvas-column-2-1"]'
    );
    if (!row1Column || !row2Column) {
      throw new Error("expected both row columns to be present");
    }

    const headingWrapper = (
      row1Column.querySelector("h1") as HTMLElement
    ).closest(".edt-element") as HTMLElement;

    const dt = new FakeDataTransfer();
    fireDragEvent("dragstart", headingWrapper, { dataTransfer: dt });
    fireDragEvent("dragover", row2Column, { dataTransfer: dt });
    fireDragEvent("drop", row2Column, { dataTransfer: dt });

    // The h1 disappears from row 1 and appears in row 2.
    expect(row1Column.querySelector("h1")).toBeNull();
    expect(row2Column.querySelector("h1")?.textContent).toBe("70% OFF");
  });

  it("drops a new element on an empty canvas via the empty-state drop zone", () => {
    renderEditor("bold-sale-announcement");

    // Delete the existing rows so the canvas falls into its empty state.
    fireEvent.click(getRowInner(1));
    fireEvent.click(screen.getByRole("button", { name: "Delete row" }));
    fireEvent.click(getRowInner(1));
    fireEvent.click(screen.getByRole("button", { name: "Delete row" }));
    expect(screen.queryByLabelText("Row 1")).not.toBeInTheDocument();

    const emptyZone = document.querySelector<HTMLElement>(".edt-canvas-empty");
    if (!emptyZone) throw new Error("expected empty-state drop zone");

    const headingCard = screen.getByRole("button", {
      name: "Drag to add Heading",
    });
    const dt = new FakeDataTransfer();
    fireDragEvent("dragstart", headingCard, { dataTransfer: dt });
    fireDragEvent("dragover", emptyZone, { dataTransfer: dt });
    fireDragEvent("drop", emptyZone, { dataTransfer: dt });

    // A row containing the new heading is created. The heading text shows up
    // both as the rendered <h2> in the canvas and as the value of the Text
    // textarea in the auto-opened Element tab, so we look for the heading
    // role specifically.
    expect(screen.getByLabelText("Row 1")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Headline text" })
    ).toBeInTheDocument();
  });

  it("collapses and reopens via the chevron toggles", async () => {
    const user = userEvent.setup();
    renderEditor();

    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Collapse element menu" })
    );
    expect(
      screen.queryByRole("button", { name: "Search" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Open element menu" }));
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });
});

describe("Editor — config pane", () => {
  it("selects rows and elements from keyboard-activated editor surfaces", () => {
    const { container } = renderEditor("bold-sale-announcement");

    getRowInner(1).focus();
    fireEvent.keyDown(getRowInner(1), { key: "Enter" });

    expect(
      screen.getByRole("radiogroup", { name: "Columns" })
    ).toBeInTheDocument();

    const heading = container.querySelector("h1");
    if (!heading) throw new Error("expected a rendered heading in row 1");
    const elementWrapper = heading.closest(".edt-element") as HTMLElement;

    elementWrapper.focus();
    fireEvent.keyDown(elementWrapper, { key: "Enter" });

    expect(
      screen.getByRole("heading", { name: "Heading", level: 3 })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Text")).toHaveValue("70% OFF");
  });

  it("only deletes selected elements from the keyboard", () => {
    const { container } = renderEditor("bold-sale-announcement");

    const heading = container.querySelector("h1");
    if (!heading) throw new Error("expected a rendered heading in row 1");
    const elementWrapper = heading.closest(".edt-element") as HTMLElement;

    elementWrapper.focus();
    fireEvent.keyDown(elementWrapper, { key: "Delete" });
    expect(container.querySelector("h1")).not.toBeNull();

    fireEvent.keyDown(elementWrapper, { key: "Enter" });
    const selectedWrapper = container.querySelector<HTMLElement>(
      ".edt-element--selected"
    );
    if (!selectedWrapper) throw new Error("expected selected element wrapper");
    fireEvent.keyDown(selectedWrapper, { key: "Delete" });

    expect(container.querySelector("h1")).toBeNull();
    expect(screen.getByLabelText("Row 1")).toBeInTheDocument();
  });

  it("switches to the Layout tab when a row is selected and the Element tab when an element is", () => {
    const { container } = renderEditor("bold-sale-announcement");

    // No selection → Page tab. PageTab uniquely renders "Horizontal padding".
    expect(screen.getByLabelText("Horizontal padding")).toBeInTheDocument();

    // Click on a row's inner div (must be the click target itself, not a child).
    fireEvent.click(getRowInner(1));

    // Layout tab content shows row-specific fields. "Columns" with options 1-4
    // is unique to LayoutTab.
    expect(
      screen.getByRole("radiogroup", { name: "Columns" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Column gap")).toBeInTheDocument();

    // Now click an actual element child (a heading) inside the row.
    const heading = container.querySelector("h1");
    if (!heading) throw new Error("expected a rendered heading in row 1");
    const elementWrapper = heading.closest(".edt-element") as HTMLElement;
    fireEvent.click(elementWrapper);

    // Element tab content for heading exposes a "Level" radiogroup.
    expect(
      screen.getByRole("radiogroup", { name: "Level" })
    ).toBeInTheDocument();

    // Clear selection from the canvas background; the pane should reset back
    // to Page instead of keeping stale Layout/Element tab state.
    fireEvent.click(screen.getByTestId("editor-canvas").parentElement!);
    expect(
      screen.queryByRole("radiogroup", { name: "Level" })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("radiogroup", { name: "Columns" })
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText("Horizontal padding")).toBeInTheDocument();
  });

  it("shows the selected element's catalog name above the form in the Element tab", () => {
    const { container } = renderEditor("bold-sale-announcement");

    // Pick the H1 (70% OFF) which auto-routes the config pane to the
    // Element tab.
    const heading = container.querySelector("h1");
    if (!heading) throw new Error("expected an h1 in the canvas");
    fireEvent.click(heading.closest(".edt-element") as HTMLElement);

    // "Heading" appears in the configuration aside as the tab heading. The
    // word also exists in the element-menu category list, so we narrow to
    // the configuration aside.
    const configAside = screen.getByLabelText("Configuration");
    expect(
      within(configAside).getByRole("heading", { name: "Heading" })
    ).toBeInTheDocument();
  });

  it("shows a hint when the Layout or Element tab is opened without a selection", async () => {
    const user = userEvent.setup();
    renderEditor("bold-sale-announcement");

    // "Layout" also exists as an element-menu category, so scope tab clicks
    // to the configuration aside.
    const configAside = screen.getByLabelText("Configuration");

    // Switch tabs manually from the default Page tab.
    await user.click(
      within(configAside).getByRole("button", { name: "Layout" })
    );
    expect(
      screen.getByText("Select a row in the canvas to configure its layout.")
    ).toBeInTheDocument();

    await user.click(
      within(configAside).getByRole("button", { name: "Element" })
    );
    expect(
      screen.getByText("Select an element in the canvas to configure it.")
    ).toBeInTheDocument();
  });

  it("commits a valid hex value live as the user types — no blur required", async () => {
    const user = userEvent.setup();
    const { container } = renderEditor("bold-sale-announcement");

    const hexInput = screen.getByLabelText("Background value");
    await user.clear(hexInput);
    await user.type(hexInput, "#654321");

    // No blur fired yet — the canvas should already reflect the typed value.
    expect(getCanvasPaper(container).style.backgroundColor).toBe(
      "rgb(101, 67, 33)"
    );
  });

  it("commits a valid in-range number live as the user types — no blur required", async () => {
    const user = userEvent.setup();
    const { container } = renderEditor("bold-sale-announcement");

    const hPadding = screen.getByLabelText("Horizontal padding");
    await user.clear(hPadding);
    await user.type(hPadding, "48");

    expect(getCanvasPaper(container).style.paddingLeft).toBe("48px");
    expect(getCanvasPaper(container).style.paddingRight).toBe("48px");
  });

  it("changing page properties updates the canvas paper inline styles", async () => {
    const user = userEvent.setup();
    const { container } = renderEditor("bold-sale-announcement");

    // The page-tab Background field is a hex input next to a colour swatch.
    const hexInput = screen.getByLabelText("Background value");
    await user.clear(hexInput);
    await user.type(hexInput, "#abcdef");
    fireEvent.blur(hexInput);

    expect(getCanvasPaper(container).style.backgroundColor).toBe(
      "rgb(171, 205, 239)"
    );

    // The horizontal and vertical padding sliders write directly to page state
    // (commit-on-change), so the inline style flips immediately.
    const hPaddingSlider = screen.getByLabelText("Horizontal padding slider");
    fireEvent.change(hPaddingSlider, { target: { value: "48" } });
    expect(getCanvasPaper(container).style.paddingLeft).toBe("48px");
    expect(getCanvasPaper(container).style.paddingRight).toBe("48px");

    const vPaddingSlider = screen.getByLabelText("Vertical padding slider");
    fireEvent.change(vPaddingSlider, { target: { value: "24" } });
    expect(getCanvasPaper(container).style.paddingTop).toBe("24px");
    expect(getCanvasPaper(container).style.paddingBottom).toBe("24px");
  });

  it("changing layout properties updates the row inner styles", async () => {
    const user = userEvent.setup();
    renderEditor("bold-sale-announcement");

    fireEvent.click(getRowInner(1));
    // Layout tab is now active.

    // Bump vertical padding via its slider input (range fires onChange directly).
    fireEvent.change(screen.getByLabelText("Vertical padding slider"), {
      target: { value: "120" },
    });
    expect(getRowInner(1).style.paddingTop).toBe("120px");
    expect(getRowInner(1).style.paddingBottom).toBe("120px");

    // Vertical margin writes to the outer .edt-row.
    fireEvent.change(screen.getByLabelText("Vertical margin slider"), {
      target: { value: "30" },
    });
    expect(getRowOuter(1).style.marginTop).toBe("30px");
    expect(getRowOuter(1).style.marginBottom).toBe("30px");

    // Switching to 2 columns rebuilds the row with two .edt-column children.
    await user.click(screen.getByRole("radio", { name: "2" }));
    expect(getRowInner(1).querySelectorAll(".edt-column").length).toBe(2);
  });

  it("changing element properties updates the rendered element styles", () => {
    const { container } = renderEditor("bold-sale-announcement");

    // Pick the H1 (70% OFF) and select it.
    const heading = container.querySelector("h1");
    if (!heading) throw new Error("expected an h1 in the canvas");
    fireEvent.click(heading.closest(".edt-element") as HTMLElement);

    // Verify pre-state from the template.
    expect(heading.style.fontSize).toBe("132px");

    // Change Font size via its range slider.
    fireEvent.change(screen.getByLabelText("Font size slider"), {
      target: { value: "80" },
    });

    // ElementRenderer re-renders the heading with the new fontSize.
    const headingAfter = container.querySelector("h1");
    expect(headingAfter?.style.fontSize).toBe("80px");

    // Change colour via the hex input.
    const hex = screen.getByLabelText("Color value");
    fireEvent.change(hex, { target: { value: "#112233" } });
    fireEvent.blur(hex);
    expect(container.querySelector("h1")?.style.color).toBe("rgb(17, 34, 51)");
  });
});

describe("Editor — undo / redo", () => {
  it("undoes and redoes a page-property change", async () => {
    const user = userEvent.setup();
    const { container } = renderEditor("bold-sale-announcement");

    // Baseline.
    expect(getCanvasPaper(container).style.backgroundColor).toBe(
      "rgb(26, 20, 17)"
    );

    // Commit a change.
    const hex = screen.getByLabelText("Background value");
    await user.clear(hex);
    await user.type(hex, "#abcdef");
    fireEvent.blur(hex);
    expect(getCanvasPaper(container).style.backgroundColor).toBe(
      "rgb(171, 205, 239)"
    );

    // Undo via the header button.
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(getCanvasPaper(container).style.backgroundColor).toBe(
      "rgb(26, 20, 17)"
    );

    // Redo via the header button.
    await user.click(screen.getByRole("button", { name: "Redo" }));
    expect(getCanvasPaper(container).style.backgroundColor).toBe(
      "rgb(171, 205, 239)"
    );
  });

  it("disables Undo when there is no history and Redo when there is no future", async () => {
    const user = userEvent.setup();
    renderEditor("bold-sale-announcement");

    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();

    // Make one change to populate the past stack.
    const hex = screen.getByLabelText("Background value");
    await user.clear(hex);
    await user.type(hex, "#111111");
    fireEvent.blur(hex);

    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeEnabled();
  });
});

describe("Editor — viewport", () => {
  it("uses compact canvas-only chrome on mobile screens", () => {
    setEditorChromeMedia(true);

    renderEditor("bold-sale-announcement");

    expect(screen.getByTestId("editor-canvas")).toBeInTheDocument();
    expect(screen.queryByLabelText("Element menu")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Configuration")).not.toBeInTheDocument();
    expect(
      screen.getByText(
        "Please switch to desktop to be able to add elements & configure the page"
      )
    ).toBeInTheDocument();
    expect(screen.queryByRole("toolbar", { name: "History" })).toBeNull();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Desktop view" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("radio", { name: "Mobile view" })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export" })).toBeInTheDocument();
  });

  it("toggles the canvas paper max-width between desktop and mobile", async () => {
    const user = userEvent.setup();
    const { container } = renderEditor("bold-sale-announcement");

    // Desktop is the default.
    expect(getCanvasPaper(container).style.maxWidth).toBe("1080px");

    await user.click(screen.getByRole("radio", { name: "Mobile view" }));
    expect(getCanvasPaper(container).style.maxWidth).toBe("390px");

    await user.click(screen.getByRole("radio", { name: "Desktop view" }));
    expect(getCanvasPaper(container).style.maxWidth).toBe("1080px");
  });

  it("marks the active viewport via aria-checked", async () => {
    const user = userEvent.setup();
    renderEditor("bold-sale-announcement");

    const desktop = screen.getByRole("radio", { name: "Desktop view" });
    const mobile = screen.getByRole("radio", { name: "Mobile view" });

    expect(desktop).toHaveAttribute("aria-checked", "true");
    expect(mobile).toHaveAttribute("aria-checked", "false");

    await user.click(mobile);
    expect(desktop).toHaveAttribute("aria-checked", "false");
    expect(mobile).toHaveAttribute("aria-checked", "true");
  });
});

describe("Editor — build & export", () => {
  it("opens the build modal, runs the export, and lands on the done message", async () => {
    const user = userEvent.setup();

    // The exporter falls back to URL.createObjectURL + an `<a>` click when the
    // browser doesn't expose `showSaveFilePicker`. jsdom doesn't, so we just
    // need to make sure those primitives don't crash.
    const createObjectURL = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:fake");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    // Anchors get a real `.click()` in jsdom, but it would try to navigate;
    // stub it so the test doesn't attempt to fetch the blob: URL.
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});

    renderEditor("bold-sale-announcement");

    await user.click(screen.getByRole("button", { name: /Build & export/i }));

    // The "done" message shows after the exporter resolves.
    await waitFor(() => {
      expect(
        screen.getByText("Your page has been exported as an HTML file.")
      ).toBeInTheDocument();
    });

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toMatch(/text\/html/);
    expect(anchorClick).toHaveBeenCalled();
  });

  it("keeps the close button inert while the export is in progress", async () => {
    const user = userEvent.setup();

    // Use a never-resolving showSaveFilePicker to pin the modal at the
    // "building" status — that's the state where the X must be inert.
    Object.defineProperty(window, "showSaveFilePicker", {
      configurable: true,
      writable: true,
      value: () => new Promise<never>(() => {}),
    });

    try {
      renderEditor("bold-sale-announcement");

      await user.click(screen.getByRole("button", { name: /Build & export/i }));

      // We're stuck at "Preparing your page…" while the picker promise hangs.
      const buildingMessage = await screen.findByText(/Preparing your page/i);
      expect(buildingMessage).toBeInTheDocument();

      // The close X is rendered (FocusTrap needs a focusable target) but is
      // explicitly inert: aria-disabled set and an onClick that calls
      // e.preventDefault() instead of firing the modal's onClose.
      const closeButton = screen.getByRole("button", { name: "Close" });
      expect(closeButton).toHaveAttribute("aria-disabled", "true");

      await user.click(closeButton);

      // Modal must still be open (still showing the "building" status).
      expect(screen.getByText(/Preparing your page/i)).toBeInTheDocument();
    } finally {
      Reflect.deleteProperty(window, "showSaveFilePicker");
    }
  });
});
