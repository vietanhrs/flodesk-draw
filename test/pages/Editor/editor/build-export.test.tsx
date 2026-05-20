import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderEditor } from "../test-utils";

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
