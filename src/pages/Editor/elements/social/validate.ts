import type { ElementValidator } from "@src/pages/Editor/elements/base";
import { isSafeLinkUrl } from "@src/pages/Editor/elements/shared/urls";
import {
  failInvalidPage,
  isRecord,
  MAX_SOCIAL_LINKS,
  requireArray,
  requireColor,
  requireNumberInRange,
  requireOneOf,
  requireTextAlign,
  requireUrl,
} from "@src/pages/Editor/elements/shared/validation";

const SOCIAL_PLATFORMS = [
  "instagram",
  "twitter",
  "facebook",
  "youtube",
  "email",
  "website",
] as const;

const validateSocialLinks = (
  element: Record<string, unknown>,
  path: string
) => {
  const links = requireArray(element.links, `${path}.links`, MAX_SOCIAL_LINKS);
  links.forEach((link, linkIndex) => {
    const linkPath = `${path}.links[${linkIndex}]`;
    if (!isRecord(link)) return failInvalidPage(linkPath, "an object");
    requireOneOf(link.platform, SOCIAL_PLATFORMS, `${linkPath}.platform`);
    requireUrl(
      link.url,
      `${linkPath}.url`,
      isSafeLinkUrl,
      "an http, https, mailto, or tel URL"
    );
  });
};

export const validateSocial: ElementValidator = (element, path) => {
  validateSocialLinks(element, path);
  requireColor(element.color, `${path}.color`);
  requireNumberInRange(element.size, `${path}.size`, 12, 48);
  requireTextAlign(element.align, `${path}.align`);
  requireNumberInRange(element.gap, `${path}.gap`, 0, 48);
};
