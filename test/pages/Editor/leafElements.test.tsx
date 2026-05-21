import { GrainProvider } from "@flodesk/grain";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { registry } from "@src/pages/Editor/elements";
import type { ElementHandler, PageElement } from "@src/pages/Editor/elements";
import { createButton } from "@src/pages/Editor/elements/button/create";
import { ButtonRenderer } from "@src/pages/Editor/elements/button/Renderer";
import { validateButton } from "@src/pages/Editor/elements/button/validate";
import { createDivider } from "@src/pages/Editor/elements/divider/create";
import { DividerRenderer } from "@src/pages/Editor/elements/divider/Renderer";
import { validateDivider } from "@src/pages/Editor/elements/divider/validate";
import { createImage } from "@src/pages/Editor/elements/image/create";
import { ImageRenderer } from "@src/pages/Editor/elements/image/Renderer";
import { validateImage } from "@src/pages/Editor/elements/image/validate";
import { createQuote } from "@src/pages/Editor/elements/quote/create";
import { QuoteRenderer } from "@src/pages/Editor/elements/quote/Renderer";
import { validateQuote } from "@src/pages/Editor/elements/quote/validate";
import { createSocial } from "@src/pages/Editor/elements/social/create";
import { SocialRenderer } from "@src/pages/Editor/elements/social/Renderer";
import { validateSocial } from "@src/pages/Editor/elements/social/validate";
import { validateSpacer } from "@src/pages/Editor/elements/spacer/validate";
import { createVideo } from "@src/pages/Editor/elements/video/create";
import { VideoRenderer } from "@src/pages/Editor/elements/video/Renderer";
import { validateVideo } from "@src/pages/Editor/elements/video/validate";

const renderForm = <E extends PageElement>(
  handler: ElementHandler<E>,
  setProp = vi.fn()
) => {
  const element = handler.create();
  const Form = handler.Form;
  const renderResult = render(
    <GrainProvider>
      <Form rowId="row-1" element={element} setProp={setProp} />
    </GrainProvider>
  );
  return { element, setProp, ...renderResult };
};

const validateCreatedElement = (
  validate: (element: Record<string, unknown>, path: string) => void,
  element: PageElement
) => validate(element as unknown as Record<string, unknown>, "element");

describe("leaf element renderers", () => {
  it("quote renderer hides empty authors and sizes cite text from font size", () => {
    const quoted = { ...createQuote(), text: "Stay curious", fontSize: 20 };

    const { rerender } = render(<QuoteRenderer element={quoted} />);

    expect(screen.getByText("Stay curious")).toBeInTheDocument();
    expect(screen.getByText("— Source")).toHaveStyle({ fontSize: "11px" });

    rerender(<QuoteRenderer element={{ ...quoted, author: "" }} />);

    expect(screen.queryByText("— Source")).not.toBeInTheDocument();
  });

  it("social renderer labels links and sanitizes unsafe hrefs", () => {
    render(
      <SocialRenderer
        element={{
          ...createSocial(),
          align: "right",
          links: [
            { platform: "website", url: "javascript:alert(1)" },
            { platform: "email", url: "mailto:hello@example.com" },
          ],
        }}
      />
    );

    expect(screen.getByLabelText("Website")).toHaveAttribute("href", "#");
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "href",
      "mailto:hello@example.com"
    );
  });

  it("button renderer shows a border for transparent backgrounds and sanitizes hrefs", () => {
    render(
      <ButtonRenderer
        element={{
          ...createButton(),
          label: "Buy now",
          href: "data:text/html,unsafe",
          backgroundColor: "transparent",
          textColor: "#123456",
          align: "left",
        }}
      />
    );

    const link = screen.getByRole("link", { name: "Buy now" });
    expect(link).toHaveAttribute("href", "#");
    expect(link).toHaveAttribute(
      "style",
      expect.stringContaining("background-color: transparent")
    );
    expect(link).toHaveAttribute(
      "style",
      expect.stringContaining("border: 1px solid rgb(18, 52, 86)")
    );
  });

  it("image and video renderers sanitize unsafe media URLs", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    render(
      <>
        <ImageRenderer
          element={{
            ...createImage(),
            src: "javascript:alert(1)",
            alt: "Unsafe image",
            widthPct: 75,
          }}
        />
        <VideoRenderer
          element={{ ...createVideo(), url: "http://example.com/embed" }}
        />
      </>
    );

    expect(screen.getByAltText("Unsafe image")).not.toHaveAttribute("src");
    expect(screen.getByTitle("Embedded video")).toHaveAttribute(
      "src",
      "about:blank"
    );
    consoleError.mockRestore();
  });

  it("divider renderer centers partial-width dividers", () => {
    const { container, rerender } = render(
      <DividerRenderer element={{ ...createDivider(), widthPct: 60 }} />
    );

    expect(container.querySelector("hr")).toHaveStyle({
      width: "60%",
      margin: "0 20%",
    });

    rerender(
      <DividerRenderer element={{ ...createDivider(), widthPct: 100 }} />
    );

    expect(container.querySelector("hr")).toHaveStyle({ margin: "0" });
  });
});

describe("leaf element forms", () => {
  it("quote form wires secondary controls to scoped patches", () => {
    const { setProp } = renderForm(registry.quote);

    fireEvent.change(screen.getByLabelText("Author"), {
      target: { value: "Anais Nin" },
    });
    fireEvent.change(screen.getByLabelText("Font size"), {
      target: { value: "36" },
    });
    fireEvent.change(screen.getByLabelText("Color value"), {
      target: { value: "#445566" },
    });

    expect(setProp).toHaveBeenCalledWith(
      { author: "Anais Nin" },
      expect.stringMatching(/^el-.+-author$/)
    );
    expect(setProp).toHaveBeenCalledWith(
      { fontSize: 36 },
      expect.stringMatching(/^el-.+-fontSize$/)
    );
    expect(setProp).toHaveBeenCalledWith(
      { color: "#445566" },
      expect.stringMatching(/^el-.+-color$/)
    );
  });

  it("image form wires alt, width, radius, and alignment controls", async () => {
    const user = userEvent.setup();
    const { setProp } = renderForm(registry.image);

    fireEvent.change(screen.getByLabelText("Alt text"), {
      target: { value: "A product photo" },
    });
    fireEvent.change(screen.getByLabelText("Width"), {
      target: { value: "64" },
    });
    fireEvent.change(screen.getByLabelText("Corner radius"), {
      target: { value: "12" },
    });
    await user.click(
      within(screen.getByRole("radiogroup", { name: "Align" })).getAllByRole(
        "radio"
      )[0]
    );

    expect(setProp).toHaveBeenCalledWith(
      { alt: "A product photo" },
      expect.stringMatching(/^el-.+-alt$/)
    );
    expect(setProp).toHaveBeenCalledWith(
      { widthPct: 64 },
      expect.stringMatching(/^el-.+-width$/)
    );
    expect(setProp).toHaveBeenCalledWith(
      { radius: 12 },
      expect.stringMatching(/^el-.+-radius$/)
    );
    expect(setProp).toHaveBeenCalledWith({ align: "left" });
  });

  it("button form wires layout and link controls", async () => {
    const user = userEvent.setup();
    const { setProp } = renderForm(registry.button);

    fireEvent.change(screen.getByLabelText("Link URL"), {
      target: { value: "https://example.com/sale" },
    });
    fireEvent.change(screen.getByLabelText("Text color value"), {
      target: { value: "#222222" },
    });
    fireEvent.change(screen.getByLabelText("Padding X"), {
      target: { value: "40" },
    });
    fireEvent.change(screen.getByLabelText("Letter spacing"), {
      target: { value: "2" },
    });
    await user.click(
      within(screen.getByRole("radiogroup", { name: "Align" })).getAllByRole(
        "radio"
      )[2]
    );

    expect(setProp).toHaveBeenCalledWith(
      { href: "https://example.com/sale" },
      expect.stringMatching(/^el-.+-href$/)
    );
    expect(setProp).toHaveBeenCalledWith(
      { textColor: "#222222" },
      expect.stringMatching(/^el-.+-textcolor$/)
    );
    expect(setProp).toHaveBeenCalledWith(
      { paddingX: 40 },
      expect.stringMatching(/^el-.+-padx$/)
    );
    expect(setProp).toHaveBeenCalledWith(
      { letterSpacing: 2 },
      expect.stringMatching(/^el-.+-ls$/)
    );
    expect(setProp).toHaveBeenCalledWith({ align: "right" });
  });

  it("divider, social, and video forms wire remaining numeric controls", async () => {
    const user = userEvent.setup();

    const dividerSetProp = vi.fn();
    const divider = renderForm(registry.divider, dividerSetProp);
    fireEvent.change(screen.getByLabelText("Width"), {
      target: { value: "55" },
    });
    expect(dividerSetProp).toHaveBeenCalledWith(
      { widthPct: 55 },
      expect.stringMatching(/^el-.+-width$/)
    );

    divider.unmount();

    const sharedSetProp = vi.fn();
    const { unmount } = renderForm(registry.social, sharedSetProp);
    fireEvent.change(screen.getByLabelText("Gap"), {
      target: { value: "24" },
    });
    await user.click(
      within(screen.getByRole("radiogroup", { name: "Align" })).getAllByRole(
        "radio"
      )[0]
    );
    expect(sharedSetProp).toHaveBeenCalledWith(
      { gap: 24 },
      expect.stringMatching(/^el-.+-gap$/)
    );
    expect(sharedSetProp).toHaveBeenCalledWith({ align: "left" });

    unmount();
    sharedSetProp.mockClear();

    renderForm(registry.video, sharedSetProp);
    fireEvent.change(screen.getByLabelText("Width"), {
      target: { value: "80" },
    });
    expect(sharedSetProp).toHaveBeenCalledWith(
      { widthPct: 80 },
      expect.stringMatching(/^el-.+-width$/)
    );
  });
});

describe("leaf element validators", () => {
  it("accepts valid leaf element defaults", () => {
    expect(() =>
      validateCreatedElement(validateButton, createButton())
    ).not.toThrow();
    expect(() =>
      validateCreatedElement(validateDivider, createDivider())
    ).not.toThrow();
    expect(() =>
      validateCreatedElement(validateImage, createImage())
    ).not.toThrow();
    expect(() =>
      validateCreatedElement(validateQuote, createQuote())
    ).not.toThrow();
    expect(() =>
      validateCreatedElement(validateSocial, createSocial())
    ).not.toThrow();
    expect(() =>
      validateSpacer({ id: "el-1", type: "spacer", height: 32 }, "element")
    ).not.toThrow();
    expect(() =>
      validateCreatedElement(validateVideo, createVideo())
    ).not.toThrow();
  });

  it("rejects invalid leaf element values with field-specific paths", () => {
    expect(() =>
      validateQuote({ ...createQuote(), fontSize: 13 }, "element")
    ).toThrow(/element\.fontSize must be a number between 14 and 80/);
    expect(() =>
      validateDivider({ ...createDivider(), widthPct: 4 }, "element")
    ).toThrow(/element\.widthPct must be a number between 5 and 100/);
    expect(() =>
      validateSpacer({ id: "el-1", type: "spacer", height: 401 }, "element")
    ).toThrow(/element\.height must be a number between 0 and 400/);
    expect(() =>
      validateVideo(
        { ...createVideo(), url: "http://example.com/embed" },
        "element"
      )
    ).toThrow(/element\.url must be an https video URL/);
  });

  it("rejects unsafe URLs and malformed social links", () => {
    expect(() =>
      validateButton(
        { ...createButton(), href: "javascript:alert(1)" },
        "element"
      )
    ).toThrow(/element\.href must be an http, https, mailto, or tel URL/);
    expect(() =>
      validateImage(
        { ...createImage(), src: "mailto:image@example.com" },
        "element"
      )
    ).toThrow(/element\.src must be an http or https image URL/);
    expect(() =>
      validateSocial(
        {
          ...createSocial(),
          links: [{ platform: "rss", url: "https://example.com/feed" }],
        },
        "element"
      )
    ).toThrow(/element\.links\[0\]\.platform/);
    expect(() =>
      validateSocial(
        {
          ...createSocial(),
          links: [{ platform: "website", url: "javascript:alert(1)" }],
        },
        "element"
      )
    ).toThrow(
      /element\.links\[0\]\.url must be an http, https, mailto, or tel URL/
    );
  });
});
