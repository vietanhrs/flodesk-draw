import { createId } from "@src/pages/Editor/utils/ids";

import type { SocialElement } from "./types";

export const createSocial = (): SocialElement => ({
  id: createId("el"),
  type: "social",
  color: "#1f1f1f",
  size: 24,
  align: "center",
  gap: 16,
  links: [
    { platform: "instagram", url: "https://instagram.com/" },
    { platform: "email", url: "mailto:hello@example.com" },
    { platform: "website", url: "https://example.com" },
  ],
});
