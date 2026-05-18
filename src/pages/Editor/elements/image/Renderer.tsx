import { justifyOf } from "@src/pages/Editor/elements/shared/align";

import type { ImageElement } from "./types";

export const ImageRenderer = ({ element }: { element: ImageElement }) => (
  <div style={{ display: "flex", justifyContent: justifyOf(element.align) }}>
    <img
      src={element.src}
      alt={element.alt}
      style={{
        width: `${element.widthPct}%`,
        height: "auto",
        display: "block",
        borderRadius: element.radius,
        objectFit: "cover",
      }}
    />
  </div>
);
