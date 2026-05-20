import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderEditor } from "../test-utils";
import { getCanvasPaper, setEditorChromeMedia } from "./setup";

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
