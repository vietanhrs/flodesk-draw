import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FakeDataTransfer, fireDragEvent, renderEditor } from "../test-utils";
import { getRowInner } from "./setup";

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
