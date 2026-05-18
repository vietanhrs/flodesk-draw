import { GrainProvider } from "@flodesk/grain";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { handlers, registry } from "@src/pages/Editor/elements";
import type { ElementHandler, PageElement } from "@src/pages/Editor/elements";

const renderForm = <E extends PageElement>(
  handler: ElementHandler<E>,
  setProp = vi.fn()
) => {
  const element = handler.create();
  const Form = handler.Form;
  render(
    <GrainProvider>
      <Form rowId="row-1" element={element} setProp={setProp} />
    </GrainProvider>
  );
  return { element, setProp };
};

describe("Element forms", () => {
  describe("rendering", () => {
    // Smoke test every handler: the Form mounts and exposes a heading-less
    // form (so we know no element threw during render). Catches regressions
    // in shared imports (alignOptions, fontOptions, controls) cheaply.
    it.each(handlers.map((h) => [h.type, h]))(
      "renders the %s form without crashing",
      (_type, handler) => {
        renderForm(handler as ElementHandler<PageElement>);
        // At least one labelled control must exist on every form.
        expect(document.querySelectorAll("label").length).toBeGreaterThan(0);
      }
    );
  });

  describe("primary input wiring", () => {
    it("heading: typing into Text fires setProp with { text }", async () => {
      const user = userEvent.setup();
      const { setProp } = renderForm(registry.heading);

      await user.type(screen.getByLabelText("Text"), "X");

      expect(setProp).toHaveBeenCalled();
      const lastCall = setProp.mock.calls.at(-1)!;
      expect(lastCall[0]).toHaveProperty("text");
      // Debounce key should be the per-element scoped key.
      expect(lastCall[1]).toMatch(/^el-.+-text$/);
    });

    it("paragraph: typing into Text fires setProp with { text }", async () => {
      const user = userEvent.setup();
      const { setProp } = renderForm(registry.paragraph);

      await user.type(screen.getByLabelText("Text"), "Y");

      expect(setProp.mock.calls.at(-1)![0]).toHaveProperty("text");
    });

    it("quote: typing into Quote fires setProp with { text }", async () => {
      const user = userEvent.setup();
      const { setProp } = renderForm(registry.quote);

      await user.type(screen.getByLabelText("Quote"), "Z");

      expect(setProp.mock.calls.at(-1)![0]).toHaveProperty("text");
    });

    it("image: typing into Image URL fires setProp with { src }", async () => {
      const user = userEvent.setup();
      const { setProp } = renderForm(registry.image);

      await user.type(screen.getByLabelText("Image URL"), "!");

      expect(setProp.mock.calls.at(-1)![0]).toHaveProperty("src");
    });

    it("video: typing into Embed URL fires setProp with { url }", async () => {
      const user = userEvent.setup();
      const { setProp } = renderForm(registry.video);

      await user.type(screen.getByLabelText("Embed URL"), "!");

      expect(setProp.mock.calls.at(-1)![0]).toHaveProperty("url");
    });

    it("button: typing into Label fires setProp with { label }", async () => {
      const user = userEvent.setup();
      const { setProp } = renderForm(registry.button);

      await user.type(screen.getByLabelText("Label"), "!");

      expect(setProp.mock.calls.at(-1)![0]).toHaveProperty("label");
    });

    it("divider: changing Thickness fires setProp with { thickness }", () => {
      const { setProp } = renderForm(registry.divider);

      fireEvent.change(screen.getByLabelText("Thickness"), {
        target: { value: "5" },
      });

      expect(setProp).toHaveBeenCalled();
      expect(setProp.mock.calls.at(-1)![0]).toEqual({ thickness: 5 });
    });

    it("spacer: changing Height fires setProp with { height }", () => {
      const { setProp } = renderForm(registry.spacer);

      fireEvent.change(screen.getByLabelText("Height"), {
        target: { value: "48" },
      });

      expect(setProp.mock.calls.at(-1)![0]).toEqual({ height: 48 });
    });

    it("social: changing Icon size fires setProp with { size }", () => {
      const { setProp } = renderForm(registry.social);

      fireEvent.change(screen.getByLabelText("Icon size"), {
        target: { value: "32" },
      });

      expect(setProp.mock.calls.at(-1)![0]).toEqual({ size: 32 });
    });
  });

  describe("secondary interactions", () => {
    it("heading: clicking H1 in the Level segmented field fires setProp with { level }", async () => {
      const user = userEvent.setup();
      const { setProp } = renderForm(registry.heading);

      await user.click(screen.getByRole("radio", { name: "H1" }));

      expect(setProp).toHaveBeenCalledWith({ level: 1 });
    });

    it("paragraph: clicking a font weight option fires setProp with { fontWeight }", async () => {
      const user = userEvent.setup();
      const { setProp } = renderForm(registry.paragraph);

      // The "Weight" SegmentedField renders radios labelled "300", "400", ...
      await user.click(screen.getByRole("radio", { name: "700" }));

      expect(setProp).toHaveBeenCalledWith({ fontWeight: 700 });
    });

    it("social: editing a per-platform link URL fires setProp with patched { links }", () => {
      const { setProp } = renderForm(registry.social);

      // social/Form renders one TextField per link, labelled by platform name.
      // The seeded social element has an instagram link first.
      fireEvent.change(screen.getByLabelText("instagram"), {
        target: { value: "https://instagram.com/new" },
      });

      expect(setProp).toHaveBeenCalled();
      const lastPatch = setProp.mock.calls.at(-1)![0] as {
        links: { platform: string; url: string }[];
      };
      expect(lastPatch.links).toBeDefined();
      const ig = lastPatch.links.find((l) => l.platform === "instagram");
      expect(ig?.url).toBe("https://instagram.com/new");
    });

    it("button: changing the Background color (transparent toggle) fires setProp", async () => {
      const user = userEvent.setup();
      const { setProp } = renderForm(registry.button);

      // Button's Background ColorInput has allowTransparent → a "Set transparent"
      // button is rendered. Clicking it fires onChange("transparent").
      await user.click(screen.getByLabelText("Set transparent"));

      expect(setProp).toHaveBeenCalledWith(
        { backgroundColor: "transparent" },
        expect.stringMatching(/^el-.+-bg$/)
      );
    });
  });
});
