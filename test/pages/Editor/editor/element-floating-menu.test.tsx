import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { renderEditor } from "../test-utils";

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
