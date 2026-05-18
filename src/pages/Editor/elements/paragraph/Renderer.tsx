import { alignStyle } from "@src/pages/Editor/elements/shared/align";

import type { ParagraphElement } from "./types";

export const ParagraphRenderer = ({
  element,
}: {
  element: ParagraphElement;
}) => (
  <p
    style={{
      margin: 0,
      color: element.color,
      fontSize: element.fontSize,
      fontWeight: element.fontWeight,
      fontFamily: element.fontFamily,
      lineHeight: element.lineHeight,
      whiteSpace: "pre-wrap",
      ...alignStyle(element.align),
    }}
  >
    {element.text || " "}
  </p>
);
