import { createId } from "@src/pages/Editor/utils/ids";

import type { ButtonElement } from "./types";

export const createButton = (): ButtonElement => ({
  id: createId("el"),
  type: "button",
  label: "Learn more",
  href: "#",
  backgroundColor: "#1f1f1f",
  textColor: "#ffffff",
  paddingX: 32,
  paddingY: 14,
  radius: 4,
  fontSize: 14,
  align: "center",
  letterSpacing: 1.5,
});
