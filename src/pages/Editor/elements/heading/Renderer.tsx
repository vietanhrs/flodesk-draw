import { alignStyle } from "@src/pages/Editor/elements/shared/align";

import type { HeadingElement } from "./types";

export const HeadingRenderer = ({ element }: { element: HeadingElement }) => {
  const Tag = element.level === 1 ? "h1" : element.level === 2 ? "h2" : "h3";
  return (
    <Tag
      style={{
        margin: 0,
        color: element.color,
        fontSize: element.fontSize,
        fontWeight: element.fontWeight,
        fontFamily: element.fontFamily,
        letterSpacing: element.letterSpacing,
        lineHeight: 1.1,
        ...alignStyle(element.align),
      }}
    >
      {element.text || " "}
    </Tag>
  );
};
