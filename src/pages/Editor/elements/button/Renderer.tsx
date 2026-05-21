import type { CSSProperties } from "react";

import type { ElementRendererProps } from "@src/pages/Editor/elements/base";
import { justifyOf } from "@src/pages/Editor/elements/shared/align";
import { safeLinkUrl } from "@src/pages/Editor/elements/shared/urls";

import type { ButtonElement } from "./types";

export const ButtonRenderer = ({
  element,
  isPreview = false,
}: ElementRendererProps<ButtonElement>) => {
  const hasBorder =
    element.backgroundColor === "transparent" ||
    element.backgroundColor === "rgba(0,0,0,0)";
  const style: CSSProperties = {
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
  };

  return (
    <div style={{ display: "flex", justifyContent: justifyOf(element.align) }}>
      {isPreview ? (
        <span style={style}>{element.label}</span>
      ) : (
        <a
          href={safeLinkUrl(element.href)}
          onClick={(e) => e.preventDefault()}
          style={style}
        >
          {element.label}
        </a>
      )}
    </div>
  );
};
