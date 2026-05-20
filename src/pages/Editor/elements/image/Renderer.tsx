import { justifyOf } from "@src/pages/Editor/elements/shared/align";
import { safeImageUrl } from "@src/pages/Editor/elements/shared/urls";

import type { ImageElement } from "./types";

export const ImageRenderer = ({ element }: { element: ImageElement }) => (
  <div style={{ display: "flex", justifyContent: justifyOf(element.align) }}>
    <img
      src={safeImageUrl(element.src)}
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
