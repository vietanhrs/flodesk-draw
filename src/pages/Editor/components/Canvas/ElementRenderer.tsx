import type { CSSProperties } from "react";

import type { PageElement, SocialLink } from "../../state/types";

const socialLabel: Record<SocialLink["platform"], string> = {
  instagram: "Instagram",
  twitter: "Twitter",
  facebook: "Facebook",
  youtube: "YouTube",
  email: "Email",
  website: "Website",
};

const socialIcon = (platform: SocialLink["platform"]): string => {
  switch (platform) {
    case "instagram":
      return "IG";
    case "twitter":
      return "TW";
    case "facebook":
      return "FB";
    case "youtube":
      return "YT";
    case "email":
      return "@";
    case "website":
      return "W";
  }
};

interface RendererProps {
  element: PageElement;
}

const alignStyle = (align: "left" | "center" | "right"): CSSProperties => ({
  textAlign: align,
});

export const ElementRenderer = ({ element }: RendererProps) => {
  switch (element.type) {
    case "heading": {
      const Tag = (`h${element.level}` as "h1" | "h2" | "h3");
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
          {element.text || " "}
        </Tag>
      );
    }
    case "paragraph":
      return (
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
          {element.text || " "}
        </p>
      );
    case "quote":
      return (
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
    case "button": {
      const justify =
        element.align === "left"
          ? "flex-start"
          : element.align === "right"
          ? "flex-end"
          : "center";
      const hasBorder =
        element.backgroundColor === "transparent" ||
        element.backgroundColor === "rgba(0,0,0,0)";
      return (
        <div style={{ display: "flex", justifyContent: justify }}>
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
    }
    case "image": {
      const justify =
        element.align === "left"
          ? "flex-start"
          : element.align === "right"
          ? "flex-end"
          : "center";
      return (
        <div style={{ display: "flex", justifyContent: justify }}>
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
    }
    case "divider": {
      const margin =
        element.widthPct >= 100 ? "0" : `0 ${(100 - element.widthPct) / 2}%`;
      return (
        <hr
          style={{
            border: 0,
            height: element.thickness,
            backgroundColor: element.color,
            margin,
            width: `${element.widthPct}%`,
          }}
        />
      );
    }
    case "spacer":
      return (
        <div
          aria-hidden="true"
          style={{ height: element.height, width: "100%" }}
        />
      );
    case "video": {
      return (
        <div
          style={{
            width: `${element.widthPct}%`,
            margin: "0 auto",
            position: "relative",
            paddingBottom: `${(9 / 16) * element.widthPct}%`,
          }}
        >
          <iframe
            src={element.url}
            title="Embedded video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        </div>
      );
    }
    case "social": {
      const justify =
        element.align === "left"
          ? "flex-start"
          : element.align === "right"
          ? "flex-end"
          : "center";
      return (
        <div
          style={{
            display: "flex",
            justifyContent: justify,
            gap: element.gap,
          }}
        >
          {element.links.map((link, i) => (
            <a
              key={`${link.platform}-${i}`}
              href={link.url || "#"}
              onClick={(e) => e.preventDefault()}
              aria-label={socialLabel[link.platform]}
              style={{
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
              }}
            >
              {socialIcon(link.platform)}
            </a>
          ))}
        </div>
      );
    }
  }
};
