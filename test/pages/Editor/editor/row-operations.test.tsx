import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  DROP_ABOVE,
  DROP_BELOW,
  FakeDataTransfer,
  fireDragEvent,
  renderEditor,
} from "../test-utils";
import { getRowInner, getRowOuter } from "./setup";

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
