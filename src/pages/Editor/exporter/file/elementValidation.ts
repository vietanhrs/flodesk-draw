import {
  isSafeImageUrl,
  isSafeLinkUrl,
  isSafeVideoUrl,
} from "@src/pages/Editor/elements/shared/urls";

import {
  failInvalidPage,
  FONT_WEIGHTS,
  isRecord,
  MAX_ID_LENGTH,
  MAX_SHORT_TEXT_LENGTH,
  MAX_SOCIAL_LINKS,
  MAX_TEXT_LENGTH,
  MAX_TYPE_LENGTH,
  requireArray,
  requireColor,
  requireFontFamily,
  requireNumberInRange,
  requireOneOf,
  requireString,
  requireTextAlign,
  requireUrl,
} from "./validationPrimitives";

const requireCommonElementFields = (
  element: Record<string, unknown>,
  path: string
) => {
  requireString(element.id, `${path}.id`, MAX_ID_LENGTH);
  requireString(element.type, `${path}.type`, MAX_TYPE_LENGTH);
};

const validateSocialLinks = (
  element: Record<string, unknown>,
  path: string
) => {
  const links = requireArray(element.links, `${path}.links`, MAX_SOCIAL_LINKS);
  links.forEach((link, linkIndex) => {
    const linkPath = `${path}.links[${linkIndex}]`;
    if (!isRecord(link)) return failInvalidPage(linkPath, "an object");
    requireOneOf(
      link.platform,
      ["instagram", "twitter", "facebook", "youtube", "email", "website"],
      `${linkPath}.platform`
    );
    requireUrl(
      link.url,
      `${linkPath}.url`,
      isSafeLinkUrl,
      "an http, https, mailto, or tel URL"
    );
  });
};

export const validateElement = (value: unknown, path: string) => {
  if (!isRecord(value)) return failInvalidPage(path, "an object");
  const element = value;
  requireCommonElementFields(element, path);

  switch (element.type) {
    case "heading":
      requireString(element.text, `${path}.text`, MAX_TEXT_LENGTH);
      requireOneOf(element.level, [1, 2, 3] as const, `${path}.level`);
      requireColor(element.color, `${path}.color`);
      requireNumberInRange(element.fontSize, `${path}.fontSize`, 10, 200);
      requireOneOf(element.fontWeight, FONT_WEIGHTS, `${path}.fontWeight`);
      requireFontFamily(element.fontFamily, `${path}.fontFamily`);
      requireTextAlign(element.align, `${path}.align`);
      requireNumberInRange(
        element.letterSpacing,
        `${path}.letterSpacing`,
        -10,
        20
      );
      return;
    case "paragraph":
      requireString(element.text, `${path}.text`, MAX_TEXT_LENGTH);
      requireColor(element.color, `${path}.color`);
      requireNumberInRange(element.fontSize, `${path}.fontSize`, 8, 64);
      requireOneOf(element.fontWeight, FONT_WEIGHTS, `${path}.fontWeight`);
      requireFontFamily(element.fontFamily, `${path}.fontFamily`);
      requireTextAlign(element.align, `${path}.align`);
      requireNumberInRange(element.lineHeight, `${path}.lineHeight`, 1, 3);
      return;
    case "quote":
      requireString(element.text, `${path}.text`, MAX_TEXT_LENGTH);
      requireString(element.author, `${path}.author`, MAX_SHORT_TEXT_LENGTH);
      requireColor(element.color, `${path}.color`);
      requireNumberInRange(element.fontSize, `${path}.fontSize`, 14, 80);
      requireFontFamily(element.fontFamily, `${path}.fontFamily`);
      requireTextAlign(element.align, `${path}.align`);
      return;
    case "image":
      requireUrl(
        element.src,
        `${path}.src`,
        isSafeImageUrl,
        "an http or https image URL"
      );
      requireString(element.alt, `${path}.alt`, MAX_SHORT_TEXT_LENGTH);
      requireNumberInRange(element.widthPct, `${path}.widthPct`, 10, 100);
      requireTextAlign(element.align, `${path}.align`);
      requireNumberInRange(element.radius, `${path}.radius`, 0, 50);
      return;
    case "video":
      requireUrl(
        element.url,
        `${path}.url`,
        isSafeVideoUrl,
        "an https video URL"
      );
      requireNumberInRange(element.widthPct, `${path}.widthPct`, 20, 100);
      return;
    case "button":
      requireString(element.label, `${path}.label`, MAX_SHORT_TEXT_LENGTH);
      requireUrl(
        element.href,
        `${path}.href`,
        isSafeLinkUrl,
        "an http, https, mailto, or tel URL"
      );
      requireColor(element.backgroundColor, `${path}.backgroundColor`, {
        allowTransparent: true,
      });
      requireColor(element.textColor, `${path}.textColor`);
      requireNumberInRange(element.paddingX, `${path}.paddingX`, 0, 80);
      requireNumberInRange(element.paddingY, `${path}.paddingY`, 0, 60);
      requireNumberInRange(element.radius, `${path}.radius`, 0, 50);
      requireNumberInRange(element.fontSize, `${path}.fontSize`, 10, 32);
      requireTextAlign(element.align, `${path}.align`);
      requireNumberInRange(
        element.letterSpacing,
        `${path}.letterSpacing`,
        0,
        10
      );
      return;
    case "divider":
      requireColor(element.color, `${path}.color`);
      requireNumberInRange(element.thickness, `${path}.thickness`, 1, 20);
      requireNumberInRange(element.widthPct, `${path}.widthPct`, 5, 100);
      return;
    case "spacer":
      requireNumberInRange(element.height, `${path}.height`, 0, 400);
      return;
    case "social":
      validateSocialLinks(element, path);
      requireColor(element.color, `${path}.color`);
      requireNumberInRange(element.size, `${path}.size`, 12, 48);
      requireTextAlign(element.align, `${path}.align`);
      requireNumberInRange(element.gap, `${path}.gap`, 0, 48);
      return;
    default:
      return failInvalidPage(`${path}.type`, "a supported element type");
  }
};
