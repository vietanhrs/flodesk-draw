import { alignStyle } from "@src/pages/Editor/elements/shared/align";

import type { QuoteElement } from "./types";

export const QuoteRenderer = ({ element }: { element: QuoteElement }) => (
  <blockquote
    style={{
      margin: 0,
      fontStyle: "italic",
      color: element.color,
      fontSize: element.fontSize,
      fontFamily: element.fontFamily,
      ...alignStyle(element.align),
    }}
  >
    <div>{element.text}</div>
    {element.author ? (
      <cite
        style={{
          display: "block",
          marginTop: 12,
          fontStyle: "normal",
          fontSize: Math.max(11, element.fontSize * 0.4),
          letterSpacing: 2,
          textTransform: "uppercase",
          opacity: 0.7,
        }}
      >
        {element.author}
      </cite>
    ) : null}
  </blockquote>
);
