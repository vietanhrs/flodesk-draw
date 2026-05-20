import { createId } from "@src/pages/Editor/utils/ids";

import type { PageData } from "../types";
import { row } from "./helpers";

export const thankYouNote = (): PageData => ({
  title: "Thank you note",
  backgroundColor: "#ece4d6",
  paddingX: 0,
  paddingY: 0,
  rows: [
    row({
      paddingY: 100,
      paddingX: 72,
      backgroundColor: "transparent",
      columns: [
        [
          {
            id: createId("el"),
            type: "heading",
            text: "thank you",
            level: 1,
            color: "#2a201b",
            fontSize: 86,
            fontWeight: 400,
            fontFamily: "Georgia, 'Times New Roman', serif",
            align: "center",
            letterSpacing: -1.5,
          },
          {
            id: createId("el"),
            type: "paragraph",
            text: "FOR BEING HERE",
            color: "#6a5849",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "center",
            lineHeight: 1.6,
          },
          {
            id: createId("el"),
            type: "paragraph",
            text: "Your support means more than you know. Every order, message, and share helps keep this small studio going.",
            color: "#4a3d34",
            fontSize: 16,
            fontWeight: 400,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "center",
            lineHeight: 1.85,
          },
          {
            id: createId("el"),
            type: "paragraph",
            text: "As a little token, here is a code for 15% off your next order: STAY15",
            color: "#4a3d34",
            fontSize: 16,
            fontWeight: 400,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "center",
            lineHeight: 1.85,
          },
          {
            id: createId("el"),
            type: "spacer",
            height: 32,
          },
          {
            id: createId("el"),
            type: "paragraph",
            text: "with gratitude,",
            color: "#5a4838",
            fontSize: 22,
            fontWeight: 400,
            fontFamily: "Georgia, 'Times New Roman', serif",
            align: "center",
            lineHeight: 1.4,
          },
          {
            id: createId("el"),
            type: "paragraph",
            text: "THE ATELIER TEAM",
            color: "#8a7665",
            fontSize: 11,
            fontWeight: 500,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "center",
            lineHeight: 1.6,
          },
        ],
      ],
    }),
  ],
});
