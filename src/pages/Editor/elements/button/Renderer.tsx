import { justifyOf } from "@src/pages/Editor/elements/shared/align";

import type { ButtonElement } from "./types";

export const ButtonRenderer = ({ element }: { element: ButtonElement }) => {
  const hasBorder =
    element.backgroundColor === "transparent" ||
    element.backgroundColor === "rgba(0,0,0,0)";
  return (
    <div style={{ display: "flex", justifyContent: justifyOf(element.align) }}>
      <a
        href={element.href || "#"}
        onClick={(e) => e.preventDefault()}
        style={{
          display: "inline-block",
          backgroundColor: element.backgroundColor,
          color: element.textColor,
          padding: `${element.paddingY}px ${element.paddingX}px`,
          borderRadius: element.radius,
          fontSize: element.fontSize,
          fontWeight: 600,
          letterSpacing: element.letterSpacing,
          textTransform: "uppercase",
          textDecoration: "none",
          border: hasBorder ? `1px solid ${element.textColor}` : "none",
          fontFamily: "'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {element.label}
      </a>
    </div>
  );
};
