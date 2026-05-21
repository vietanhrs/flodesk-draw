import type { CSSProperties } from "react";

import type { ElementRendererProps } from "@src/pages/Editor/elements/base";
import { justifyOf } from "@src/pages/Editor/elements/shared/align";
import { safeLinkUrl } from "@src/pages/Editor/elements/shared/urls";

import { socialIcon, socialLabel } from "./labels";
import type { SocialElement } from "./types";

export const SocialRenderer = ({
  element,
  isPreview = false,
}: ElementRendererProps<SocialElement>) => (
  <div
    style={{
      display: "flex",
      justifyContent: justifyOf(element.align),
      gap: element.gap,
    }}
  >
    {element.links.map((link, i) => {
      const key = `${link.platform}-${i}`;
      const style: CSSProperties = {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: element.size + 16,
        height: element.size + 16,
        borderRadius: "50%",
        border: `1px solid ${element.color}`,
        color: element.color,
        fontSize: element.size * 0.55,
        fontWeight: 600,
        textDecoration: "none",
        fontFamily: "'Helvetica Neue', Arial, sans-serif",
      };

      return isPreview ? (
        <span key={key} aria-hidden="true" style={style}>
          {socialIcon[link.platform]}
        </span>
      ) : (
        <a
          key={key}
          href={safeLinkUrl(link.url)}
          onClick={(e) => e.preventDefault()}
          aria-label={socialLabel[link.platform]}
          style={style}
        >
          {socialIcon[link.platform]}
        </a>
      );
    })}
  </div>
);
