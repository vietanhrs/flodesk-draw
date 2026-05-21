import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import * as exporter from "@src/pages/Editor/exporter/exportFile";
import * as flodeskFile from "@src/pages/Editor/exporter/flodeskFile";
import { createEmptyPage } from "@src/pages/Editor/state/initialData";

import { renderEditor } from "./test-utils";

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Editor — Header", () => {
  it("renders the Flodesk logo as a link to /", () => {
    renderEditor();

    const logo = screen.getByRole("link", { name: "Flodesk homepage" });
    expect(logo).toHaveAttribute("href", "/");
  });

  it("renders no filename when no file has been loaded", () => {
    renderEditor();

    expect(screen.queryByLabelText("Current file")).not.toBeInTheDocument();
  });

  it("invokes saveFlodeskFile when the Save button is clicked", async () => {
    const user = userEvent.setup();
    const saveSpy = vi
      .spyOn(flodeskFile, "saveFlodeskFile")
      .mockResolvedValue({ name: "untitled" });

    renderEditor();
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(saveSpy).toHaveBeenCalledTimes(1));
    // The provider had no initial file → first arg is the page; the handle
    // arg should be undefined (no FS handle yet).
    const [, handle] = saveSpy.mock.calls[0];
    expect(handle).toBeUndefined();
  });

  it("shows the loaded filename in the header after Save resolves with a name", async () => {
    const user = userEvent.setup();
    vi.spyOn(flodeskFile, "saveFlodeskFile").mockResolvedValue({
      name: "launch-announcement",
    });

    renderEditor();
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() =>
      expect(screen.getByLabelText("Current file")).toHaveTextContent(
        "launch-announcement"
      )
    );
  });

  it("labels fallback-origin file saves as a download copy", () => {
    renderEditor({
      initialFile: { name: "fallback-draft", page: createEmptyPage() },
    });

    expect(
      screen.getByRole("button", { name: "Download copy" })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Save" })
    ).not.toBeInTheDocument();
  });

  it("shows a danger toast when Save throws", async () => {
    const user = userEvent.setup();
    vi.spyOn(flodeskFile, "saveFlodeskFile").mockRejectedValue(
      new Error("disk full")
    );
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    renderEditor();
    await user.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(errorSpy).toHaveBeenCalled());
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Could not save your .flodesk file. Please try again."
    );
    // No "Current file" label appears since the save never resolved.
    expect(screen.queryByLabelText("Current file")).not.toBeInTheDocument();
  });

  it("kicks off the build flow and shows the success modal when export resolves", async () => {
    const user = userEvent.setup();
    const exportSpy = vi
      .spyOn(exporter, "exportPageAsHtml")
      .mockResolvedValue({ ok: true });

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

  it("hides the modal and shows nothing when export is cancelled by the user", async () => {
    const user = userEvent.setup();
    const exportSpy = vi
      .spyOn(exporter, "exportPageAsHtml")
      .mockResolvedValue({ ok: false, reason: "cancelled" });

    renderEditor();
    await user.click(screen.getByRole("button", { name: "Build & export" }));

    await waitFor(() => expect(exportSpy).toHaveBeenCalledTimes(1));

    expect(
      screen.queryByText(/Your page has been exported/)
    ).not.toBeInTheDocument();
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
