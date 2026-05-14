export interface Category {
  id: string;
  label: string;
}

export const ALL_CATEGORY_ID = "all";

export const categories: Category[] = [
  { id: ALL_CATEGORY_ID, label: "Browse all" },
  { id: "share-news", label: "Share news" },
  { id: "welcome", label: "Welcome" },
  { id: "make-money", label: "Make money" },
  { id: "say-thanks", label: "Say thanks" },
  { id: "inspire", label: "Inspire" },
  { id: "plain-text", label: "Plain text" },
];

export const getCategoryLabel = (id: string): string =>
  categories.find((c) => c.id === id)?.label ?? "";
