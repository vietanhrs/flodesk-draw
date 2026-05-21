import { describe, expect, it } from "vitest";

import {
  isSafeImageUrl,
  isSafeLinkUrl,
  isSafeVideoUrl,
  safeImageUrl,
  safeLinkUrl,
  safeVideoUrl,
  VIDEO_IFRAME_SANDBOX,
} from "@src/pages/Editor/elements/shared/urls";

describe("URL helpers", () => {
  it("accepts safe absolute links and rejects relative or scripted links", () => {
    expect(isSafeLinkUrl("https://example.com/sale")).toBe(true);
    expect(isSafeLinkUrl("mailto:hello@example.com")).toBe(true);
    expect(isSafeLinkUrl("tel:+84123456789")).toBe(true);
    expect(isSafeLinkUrl("/sale")).toBe(false);
    expect(isSafeLinkUrl("javascript:alert(1)")).toBe(false);
    expect(safeLinkUrl("javascript:alert(1)")).toBe("#");
  });

  it("accepts safe image URLs and strips unsafe ones", () => {
    expect(isSafeImageUrl("https://cdn.example.com/image.jpg")).toBe(true);
    expect(isSafeImageUrl("//cdn.example.com/image.jpg")).toBe(false);
    expect(safeImageUrl("http://cdn.example.com/image.jpg")).toBe(
      "http://cdn.example.com/image.jpg"
    );
    expect(safeImageUrl("data:text/html,unsafe")).toBe("");
  });

  it("allows only supported HTTPS video embed URLs", () => {
    expect(isSafeVideoUrl("https://www.youtube.com/embed/abc123")).toBe(true);
    expect(isSafeVideoUrl("https://player.vimeo.com/video/12345")).toBe(true);
    expect(isSafeVideoUrl("https://www.youtube.com/watch?v=abc123")).toBe(
      false
    );
    expect(isSafeVideoUrl("http://www.youtube.com/embed/abc123")).toBe(false);
    expect(safeVideoUrl("https://example.com/embed/123")).toBe("about:blank");
    expect(VIDEO_IFRAME_SANDBOX).toContain("allow-scripts");
  });
});
