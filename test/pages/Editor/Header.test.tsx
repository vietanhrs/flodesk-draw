import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as exporter from "@src/pages/Editor/exporter/exportFile";

import { renderEditor } from "./test-utils";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Editor — Header build flow", () => {
  it("commits the page title on blur", async () => {
    const user = userEvent.setup();
    renderEditor();

    const titleInput = screen.getByLabelText("Page title");
    expect(titleInput).toHaveValue("Untitled page");

    await user.clear(titleInput);
    await user.type(titleInput, "Launch announcement");
    // Blur to commit
    await user.tab();

    // The value persists (the input is controlled by page.title via context).
    expect(screen.getByLabelText("Page title")).toHaveValue(
      "Launch announcement"
    );
  });

  it("commits the page title when the form is submitted", async () => {
    const user = userEvent.setup();
    renderEditor();

    const titleInput = screen.getByLabelText("Page title");
    await user.clear(titleInput);
    await user.type(titleInput, "Submitted{Enter}");

    expect(screen.getByLabelText("Page title")).toHaveValue("Submitted");
    // After submit, the input loses focus (form's onSubmit blurs it).
    expect(titleInput).not.toHaveFocus();
  });

  it("syncs the title input when page.title changes externally via undo", async () => {
    const user = userEvent.setup();
    renderEditor();

    const titleInput = screen.getByLabelText("Page title");
    await user.clear(titleInput);
    await user.type(titleInput, "First");
    await user.tab(); // commit "First"

    // Undo reverts page.title back to "Untitled page".
    await user.click(screen.getByLabelText("Undo"));

    await waitFor(() =>
      expect(screen.getByLabelText("Page title")).toHaveValue("Untitled page")
    );
  });

  it("kicks off the build flow and shows the success modal when export resolves", async () => {
    const user = userEvent.setup();
    const exportSpy = vi
      .spyOn(exporter, "exportPageAsHtml")
      .mockResolvedValue(true);

    renderEditor();
    await user.click(screen.getByRole("button", { name: "Build & export" }));

    await waitFor(() =>
      expect(
        screen.getByText("Your page has been exported as an HTML file.")
      ).toBeInTheDocument()
    );
    expect(exportSpy).toHaveBeenCalledTimes(1);
  });

  it("shows the error modal when export rejects", async () => {
    const user = userEvent.setup();
    vi.spyOn(exporter, "exportPageAsHtml").mockRejectedValue(
      new Error("disk full")
    );
    // Editor.handleBuild logs the failure; silence to keep the test output clean.
    vi.spyOn(console, "error").mockImplementation(() => {});

    renderEditor();
    await user.click(screen.getByRole("button", { name: "Build & export" }));

    await waitFor(() =>
      expect(
        screen.getByText(
          "Something went wrong while exporting. Please try again."
        )
      ).toBeInTheDocument()
    );
  });

  it("hides the modal and shows nothing when export returns false (user cancelled)", async () => {
    const user = userEvent.setup();
    vi.spyOn(exporter, "exportPageAsHtml").mockResolvedValue(false);

    renderEditor();
    await user.click(screen.getByRole("button", { name: "Build & export" }));

    // The modal closes itself when export returns false (no file picker accepted).
    await waitFor(() =>
      expect(
        screen.queryByText(/Your page has been exported/)
      ).not.toBeInTheDocument()
    );
    expect(
      screen.queryByText(/Something went wrong while exporting/)
    ).not.toBeInTheDocument();
  });

  it("toggles desktop and mobile viewport from the header radio group", async () => {
    const user = userEvent.setup();
    renderEditor();

    const desktop = screen.getByRole("radio", { name: "Desktop view" });
    const mobile = screen.getByRole("radio", { name: "Mobile view" });
    expect(desktop).toHaveAttribute("aria-checked", "true");

    await user.click(mobile);
    expect(mobile).toHaveAttribute("aria-checked", "true");
    expect(desktop).toHaveAttribute("aria-checked", "false");
  });
});
