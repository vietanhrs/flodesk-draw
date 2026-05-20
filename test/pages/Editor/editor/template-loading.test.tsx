import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import type { LoadedFile } from "@src/pages/Editor/exporter/flodeskFile";
import { createEmptyPage } from "@src/pages/Editor/state/initialData";

import { renderEditor } from "../test-utils";
import { getRowInner, RouteSwitchControls } from "./setup";

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
