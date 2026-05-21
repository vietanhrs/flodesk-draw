import type { Viewport } from "./state/types";

export const MOBILE_EDITOR_QUERY = "(max-width: 767px)";

export const EDITOR_CANVAS_MAX_WIDTH: Record<Viewport, number> = {
  desktop: 1080,
  mobile: 390,
};
