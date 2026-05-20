import { createId } from "@src/pages/Editor/utils/ids";

import type { PageData } from "../types";
import { row } from "./helpers";

export const findYourLight = (): PageData => ({
  title: "Find your light",
  backgroundColor: "#faf6ef",
  paddingX: 0,
  paddingY: 0,
  rows: [
    row({
      paddingY: 80,
      paddingX: 64,
      backgroundColor: "transparent",
      columns: [
        [
          {
            id: createId("el"),
            type: "paragraph",
            text: "A MONDAY NOTE",
            color: "#a08c75",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "left",
            lineHeight: 1.6,
          },
        ],
      ],
    }),
    row({
      paddingY: 24,
      paddingX: 64,
      backgroundColor: "transparent",
      columns: [
        [
          {
            id: createId("el"),
            type: "quote",
            text: "Almost everything will work again if you unplug it for a few minutes — including you.",
            author: "Anne Lamott",
            color: "#2a241f",
            fontSize: 42,
            fontFamily: "Georgia, 'Times New Roman', serif",
            align: "left",
          },
        ],
      ],
    }),
    row({
      paddingY: 80,
      paddingX: 64,
      backgroundColor: "transparent",
      columnsCount: 2,
      columnWidths: [2, 1],
      columnGap: 24,
      columns: [
        [
          {
            id: createId("el"),
            type: "button",
            label: "Read this week",
            href: "",
            backgroundColor: "transparent",
            textColor: "#2a241f",
            paddingX: 0,
            paddingY: 8,
            radius: 0,
            fontSize: 13,
            align: "left",
            letterSpacing: 3,
          },
        ],
        [
          {
            id: createId("el"),
            type: "paragraph",
            text: "NO. 042",
            color: "#b0a08c",
            fontSize: 11,
            fontWeight: 500,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "right",
            lineHeight: 1.6,
          },
        ],
      ],
    }),
  ],
});
