// ─────────────────────────────────────────────────────────────
// OG Image — Dynamic Open Graph image generation
// ─────────────────────────────────────────────────────────────

import { ImageResponse } from "next/og";

export const alt = "CineStack — Movie Database";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a24 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,197,24,0.15) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -150,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(245,197,24,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Brand mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#f5c518",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 900,
              color: "#0a0a0f",
            }}
          >
            C
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "#f5f5f1",
            letterSpacing: "-0.03em",
            textAlign: "center",
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          CineStack
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: 28,
            color: "#f5c518",
            letterSpacing: "0.01em",
            margin: "16px 0 0 0",
            textAlign: "center",
          }}
        >
          Discover · Review · Track
        </p>
      </div>
    ),
    {
      ...size,
    },
  );
}
