import { describe, expect, it } from "vitest";

import {
  assertFileSize,
  failTooLarge,
  requireColumnsCount,
} from "@src/pages/Editor/exporter/file/validationPrimitives";

describe("validation primitives", () => {
  it("accepts supported column counts and rejects everything else", () => {
    expect(requireColumnsCount(1, "row.columnsCount")).toBe(1);
    expect(requireColumnsCount(4, "row.columnsCount")).toBe(4);
    expect(() => requireColumnsCount(5, "row.columnsCount")).toThrow(
      /row\.columnsCount must be 1, 2, 3, or 4/
    );
  });

  it("throws when a Flodesk file is too large", () => {
    expect(() => failTooLarge()).toThrow(/Flodesk file is too large/);
    expect(() => assertFileSize(1_000_001)).toThrow(
      /Flodesk file is too large/
    );
  });

  it("allows file sizes at or below the configured limit", () => {
    expect(() => assertFileSize(1_000_000)).not.toThrow();
  });
});
