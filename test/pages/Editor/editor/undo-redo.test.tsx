import { fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderEditor } from "../test-utils";
import { getCanvasPaper } from "./setup";

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
    fireEvent.change(hex, { target: { value: "#abcdef" } });
    fireEvent.blur(hex);
    expect(getCanvasPaper(container).style.backgroundColor).toBe(
      "rgb(171, 205, 239)"
    );

    // Undo via the header button.
    await user.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() => {
      expect(getCanvasPaper(container).style.backgroundColor).toBe(
        "rgb(26, 20, 17)"
      );
    });

    // Redo via the header button.
    await user.click(screen.getByRole("button", { name: "Redo" }));
    await waitFor(() => {
      expect(getCanvasPaper(container).style.backgroundColor).toBe(
        "rgb(171, 205, 239)"
      );
    });
  });

  it("disables Undo when there is no history and Redo when there is no future", async () => {
    const user = userEvent.setup();
    renderEditor("bold-sale-announcement");

    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();

    // Make one change to populate the past stack.
    const hex = screen.getByLabelText("Background value");
    fireEvent.change(hex, { target: { value: "#111111" } });
    fireEvent.blur(hex);

    expect(screen.getByRole("button", { name: "Undo" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeEnabled();
  });
});
