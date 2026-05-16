import type { ComponentType, SVGProps } from "react";

import {
  IconBolt,
  IconBulletList,
  IconImage,
  IconLink,
  IconMinus,
  IconPlay,
  IconRows,
  IconType,
} from "@flodesk/grain";

import type { ElementType, PageElement } from "./types";
import { createId } from "../utils/ids";

export interface ElementCategory {
  id: string;
  label: string;
}

export interface ElementDefinition {
  type: ElementType;
  name: string;
  category: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  create: () => PageElement;
}

export const elementCategories: ElementCategory[] = [
  { id: "text", label: "Text" },
  { id: "media", label: "Media" },
  { id: "buttons", label: "Buttons" },
  { id: "layout", label: "Layout" },
  { id: "social", label: "Social" },
];

export const elementDefinitions: ElementDefinition[] = [
  {
    type: "heading",
    name: "Heading",
    category: "text",
    icon: IconType,
    create: () => ({
      id: createId("el"),
      type: "heading",
      text: "Headline text",
      level: 2,
      color: "#1f1f1f",
      fontSize: 36,
      fontWeight: 600,
      fontFamily: "Georgia, 'Times New Roman', serif",
      align: "left",
      letterSpacing: 0,
    }),
  },
  {
    type: "paragraph",
    name: "Paragraph",
    category: "text",
    icon: IconBulletList,
    create: () => ({
      id: createId("el"),
      type: "paragraph",
      text: "Write something thoughtful. Click to edit this paragraph.",
      color: "#3a3a3a",
      fontSize: 16,
      fontWeight: 400,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      align: "left",
      lineHeight: 1.7,
    }),
  },
  {
    type: "quote",
    name: "Quote",
    category: "text",
    icon: IconType,
    create: () => ({
      id: createId("el"),
      type: "quote",
      text: "A short, memorable quote goes right here.",
      author: "— Source",
      color: "#2a241f",
      fontSize: 24,
      fontFamily: "Georgia, 'Times New Roman', serif",
      align: "center",
    }),
  },
  {
    type: "image",
    name: "Image",
    category: "media",
    icon: IconImage,
    create: () => ({
      id: createId("el"),
      type: "image",
      src: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=1200",
      alt: "Placeholder image",
      widthPct: 100,
      align: "center",
      radius: 0,
    }),
  },
  {
    type: "video",
    name: "Video",
    category: "media",
    icon: IconPlay,
    create: () => ({
      id: createId("el"),
      type: "video",
      url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      widthPct: 100,
    }),
  },
  {
    type: "button",
    name: "Button",
    category: "buttons",
    icon: IconBolt,
    create: () => ({
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
    }),
  },
  {
    type: "divider",
    name: "Divider",
    category: "layout",
    icon: IconMinus,
    create: () => ({
      id: createId("el"),
      type: "divider",
      color: "#d8d2c5",
      thickness: 1,
      widthPct: 100,
    }),
  },
  {
    type: "spacer",
    name: "Spacer",
    category: "layout",
    icon: IconRows,
    create: () => ({
      id: createId("el"),
      type: "spacer",
      height: 32,
    }),
  },
  {
    type: "social",
    name: "Social links",
    category: "social",
    icon: IconLink,
    create: () => ({
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
    }),
  },
];

export const findElementDefinition = (type: ElementType) =>
  elementDefinitions.find((d) => d.type === type);
