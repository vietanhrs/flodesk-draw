import type { DividerElement } from "./types";

export const DividerRenderer = ({ element }: { element: DividerElement }) => {
  const margin =
    element.widthPct >= 100 ? "0" : `0 ${(100 - element.widthPct) / 2}%`;
  return (
    <hr
      style={{
        border: 0,
        height: element.thickness,
        backgroundColor: element.color,
        margin,
        width: `${element.widthPct}%`,
      }}
    />
  );
};
