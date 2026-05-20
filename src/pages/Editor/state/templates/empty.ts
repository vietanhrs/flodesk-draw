import { createId } from "@src/pages/Editor/utils/ids";

import type { PageData } from "../types";
import { row } from "./helpers";

export const createEmptyPage = (): PageData => ({
  title: "Untitled page",
  backgroundColor: "#ffffff",
  paddingX: 0,
  paddingY: 0,
  rows: [
    row({
      paddingY: 96,
      columns: [
        [
          {
            id: createId("el"),
            type: "heading",
            text: "Build something beautiful",
            level: 1,
            color: "#1f1f1f",
            fontSize: 56,
            fontWeight: 600,
            fontFamily: "Georgia, 'Times New Roman', serif",
            align: "center",
            letterSpacing: -1,
          },
          {
            id: createId("el"),
            type: "paragraph",
            text: "Drop elements from the menu on the left to start your page. Click any element to edit it on the right.",
            color: "#5a5a5a",
            fontSize: 18,
            fontWeight: 400,
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            align: "center",
            lineHeight: 1.6,
          },
          {
            id: createId("el"),
            type: "button",
            label: "Get started",
            href: "",
            backgroundColor: "#1f1f1f",
            textColor: "#ffffff",
            paddingX: 36,
            paddingY: 16,
            radius: 4,
            fontSize: 14,
            align: "center",
            letterSpacing: 1.5,
          },
        ],
      ],
    }),
  ],
});
