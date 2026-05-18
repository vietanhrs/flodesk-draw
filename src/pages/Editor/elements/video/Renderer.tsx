import type { VideoElement } from "./types";

export const VideoRenderer = ({ element }: { element: VideoElement }) => (
  <div
    style={{
      width: `${element.widthPct}%`,
      margin: "0 auto",
      position: "relative",
      paddingBottom: `${(9 / 16) * element.widthPct}%`,
    }}
  >
    <iframe
      src={element.url}
      title="Embedded video"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        border: 0,
      }}
    />
  </div>
);
