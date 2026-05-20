import { boldSale } from "./templates/boldSale";
import { createEmptyPage } from "./templates/empty";
import { findYourLight } from "./templates/findYourLight";
import { quickUpdate } from "./templates/quickUpdate";
import { springNewsletter } from "./templates/springNewsletter";
import { thankYouNote } from "./templates/thankYouNote";
import { welcomeFamily } from "./templates/welcomeFamily";
import type { PageData } from "./types";

const templateBuilders: Record<string, () => PageData> = {
  "bold-sale-announcement": boldSale,
  "welcome-to-the-family": welcomeFamily,
  "spring-newsletter": springNewsletter,
  "thank-you-note": thankYouNote,
  "find-your-light": findYourLight,
  "quick-update": quickUpdate,
};

const fallbackTemplate = createEmptyPage;

export { createEmptyPage };

export const buildPageForTemplate = (
  templateId: string | undefined
): PageData => {
  if (!templateId) return fallbackTemplate();
  return (templateBuilders[templateId] ?? fallbackTemplate)();
};
