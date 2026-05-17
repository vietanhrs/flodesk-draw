export type ElementType =
  | "heading"
  | "paragraph"
  | "button"
  | "image"
  | "divider"
  | "spacer"
  | "quote"
  | "social"
  | "video";

export type TextAlign = "left" | "center" | "right";

interface BaseElement {
  id: string;
  type: ElementType;
}

export interface HeadingElement extends BaseElement {
  type: "heading";
  text: string;
  level: 1 | 2 | 3;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  align: TextAlign;
  letterSpacing: number;
}

export interface ParagraphElement extends BaseElement {
  type: "paragraph";
  text: string;
  color: string;
  fontSize: number;
  fontWeight: number;
  fontFamily: string;
  align: TextAlign;
  lineHeight: number;
}

export interface ButtonElement extends BaseElement {
  type: "button";
  label: string;
  href: string;
  backgroundColor: string;
  textColor: string;
  paddingX: number;
  paddingY: number;
  radius: number;
  fontSize: number;
  align: TextAlign;
  letterSpacing: number;
}

export interface ImageElement extends BaseElement {
  type: "image";
  src: string;
  alt: string;
  widthPct: number;
  align: TextAlign;
  radius: number;
}

export interface DividerElement extends BaseElement {
  type: "divider";
  color: string;
  thickness: number;
  widthPct: number;
}

export interface SpacerElement extends BaseElement {
  type: "spacer";
  height: number;
}

export interface QuoteElement extends BaseElement {
  type: "quote";
  text: string;
  author: string;
  color: string;
  fontSize: number;
  fontFamily: string;
  align: TextAlign;
}

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

export interface VideoElement extends BaseElement {
  type: "video";
  url: string;
  widthPct: number;
}

export type PageElement =
  | HeadingElement
  | ParagraphElement
  | ButtonElement
  | ImageElement
  | DividerElement
  | SpacerElement
  | QuoteElement
  | SocialElement
  | VideoElement;

export interface PageRow {
  id: string;
  backgroundColor: string;
  paddingX: number;
  paddingY: number;
  marginY: number;
  columnsCount: 1 | 2 | 3 | 4;
  columnWidths: number[];
  columnGap: number;
  columns: PageElement[][];
}

export interface PageData {
  title: string;
  backgroundColor: string;
  paddingX: number;
  paddingY: number;
  rows: PageRow[];
}

export interface ElementSelection {
  rowId: string;
  columnIndex: number;
  elementId: string;
}

export interface RowSelection {
  rowId: string;
}

export type Selection =
  | ({ kind: "row" } & RowSelection)
  | ({ kind: "element" } & ElementSelection)
  | null;

export type Viewport = "desktop" | "mobile";
