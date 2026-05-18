import type { BaseElement } from "@src/pages/Editor/elements/base";
import type { TextAlign } from "@src/pages/Editor/elements/shared/types";

export interface SocialLink {
  platform:
    | "instagram"
    | "twitter"
    | "facebook"
    | "youtube"
    | "email"
    | "website";
  url: string;
}

export interface SocialElement extends BaseElement {
  type: "social";
  links: SocialLink[];
  color: string;
  size: number;
  align: TextAlign;
  gap: number;
}
