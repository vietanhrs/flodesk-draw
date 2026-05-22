import { createId } from "@src/pages/Editor/utils/ids";

import type { PageData } from "../types";
import { row } from "./helpers";

export const boldSale = (): PageData => ({
  title: "Bold sale announcement",
  backgroundColor: "#1a1411",
  paddingX: 0,
  paddingY: 0,
  rows: [
    row({
      paddingY: 96,
      paddingX: 64,
      backgroundColor: "transparent",
      columns: [
        [
          {
            id: createId("el"),
            type: "paragraph",
            text: "BLACK FRIDAY",
            color: "#f4ece1",
            fontSize: 12,
            fontWeight: 500,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "left",
            lineHeight: 1.4,
          },
          {
            id: createId("el"),
            type: "heading",
            text: "70% OFF",
            level: 1,
            color: "#f8c97a",
            fontSize: 132,
            fontWeight: 600,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "left",
            letterSpacing: -5,
          },
          {
            id: createId("el"),
            type: "paragraph",
            text: "Our biggest sale of the year. Everything in store is marked down through midnight Sunday.",
            color: "#f4ece1",
            fontSize: 17,
            fontWeight: 400,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "left",
            lineHeight: 1.7,
          },
          {
            id: createId("el"),
            type: "spacer",
            height: 24,
          },
          {
            id: createId("el"),
            type: "button",
            label: "Shop the sale",
            href: "",
            backgroundColor: "#f8c97a",
            textColor: "#1a1411",
            paddingX: 36,
            paddingY: 18,
            radius: 0,
            fontSize: 13,
            align: "left",
            letterSpacing: 1.5,
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
            type: "paragraph",
            text: "Use code BLACK70 at checkout",
            color: "#a08c75",
            fontSize: 11,
            fontWeight: 400,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "left",
            lineHeight: 1.4,
          },
        ],
      ],
    }),
  ],
});
