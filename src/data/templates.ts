import boldSale from "./templates/boldSale";
import inspireQuote from "./templates/inspireQuote";
import newsletter from "./templates/newsletter";
import plainText from "./templates/plainText";
import thankYou from "./templates/thankYou";
import welcomeFamily from "./templates/welcomeFamily";

export interface Template {
  id: string;
  title: string;
  categoryId: string;
  html: string;
}

export const templates: Template[] = [
  {
    id: "bold-sale-announcement",
    title: "Bold sale announcement",
    categoryId: "make-money",
    html: boldSale,
  },
  {
    id: "welcome-to-the-family",
    title: "Welcome to the family",
    categoryId: "welcome",
    html: welcomeFamily,
  },
  {
    id: "spring-newsletter",
    title: "Spring newsletter",
    categoryId: "share-news",
    html: newsletter,
  },
  {
    id: "thank-you-note",
    title: "Thank you note",
    categoryId: "say-thanks",
    html: thankYou,
  },
  {
    id: "find-your-light",
    title: "Find your light",
    categoryId: "inspire",
    html: inspireQuote,
  },
  {
    id: "quick-update",
    title: "Quick update",
    categoryId: "plain-text",
    html: plainText,
  },
];

export const TEMPLATE_PREVIEW_WIDTH = 600;
export const TEMPLATE_PREVIEW_HEIGHT = 785;
