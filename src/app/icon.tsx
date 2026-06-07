// ─────────────────────────────────────────────────────────────
// Favicon Icon — Dynamic SVG generation via ImageResponse
// ─────────────────────────────────────────────────────────────

import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/svg+xml";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5c518",
          borderRadius: 6,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 800, color: "#000" }}>
          CS
        </span>
      </div>
    ),
    { ...size },
  );
}
