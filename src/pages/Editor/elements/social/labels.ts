import type { SocialLink } from "./types";

export const socialLabel: Record<SocialLink["platform"], string> = {
  instagram: "Instagram",
  twitter: "Twitter",
  facebook: "Facebook",
  youtube: "YouTube",
  email: "Email",
  website: "Website",
};

export const socialIcon: Record<SocialLink["platform"], string> = {
  instagram: "IG",
  twitter: "TW",
  facebook: "FB",
  youtube: "YT",
  email: "@",
  website: "W",
};
