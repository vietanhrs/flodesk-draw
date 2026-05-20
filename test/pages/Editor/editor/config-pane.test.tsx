import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { renderEditor } from "../test-utils";
import { getCanvasPaper, getRowInner, getRowOuter } from "./setup";

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
