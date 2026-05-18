import type { CSSProperties } from "react";

import type { TextAlign } from "./types";

export const alignStyle = (align: TextAlign): CSSProperties => ({
  textAlign: align,
});

export const justifyOf = (align: TextAlign): string =>
  align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center";
