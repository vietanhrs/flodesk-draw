import {
  IconTextAlignCenter,
  IconTextAlignLeft,
  IconTextAlignRight,
} from "@flodesk/grain";

import type { TextAlign } from "./types";

export const alignOptions = [
  {
    value: "left" as TextAlign,
    label: <IconTextAlignLeft width={14} height={14} />,
  },
  {
    value: "center" as TextAlign,
    label: <IconTextAlignCenter width={14} height={14} />,
  },
  {
    value: "right" as TextAlign,
    label: <IconTextAlignRight width={14} height={14} />,
  },
];
