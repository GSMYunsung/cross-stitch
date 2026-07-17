import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// 좌표 변환: translate(16 16) scale(1.3) translate(-8 -8)
// final = 5.6 + 1.3 * original
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#F6F2E8",
          borderRadius: 6,
          display: "flex",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Leaves */}
        <div style={{ position: "absolute", left: 14.7, top: 5.6,  width: 2.6,  height: 1.3, background: "#5DAA4C" }} />
        <div style={{ position: "absolute", left: 12.1, top: 6.9,  width: 7.8,  height: 1.3, background: "#5DAA4C" }} />
        <div style={{ position: "absolute", left: 10.8, top: 8.2,  width: 10.4, height: 1.3, background: "#5DAA4C" }} />
        <div style={{ position: "absolute", left: 12.1, top: 9.5,  width: 7.8,  height: 1.3, background: "#5DAA4C" }} />
        {/* Body */}
        <div style={{ position: "absolute", left: 12.1, top: 10.8, width: 7.8,  height: 1.3, background: "#E63946" }} />
        <div style={{ position: "absolute", left: 9.5,  top: 12.1, width: 13.0, height: 1.3, background: "#E63946" }} />
        <div style={{ position: "absolute", left: 8.2,  top: 13.4, width: 15.6, height: 2.6, background: "#E63946" }} />
        <div style={{ position: "absolute", left: 6.9,  top: 16.0, width: 18.2, height: 2.6, background: "#E63946" }} />
        <div style={{ position: "absolute", left: 8.2,  top: 18.6, width: 15.6, height: 2.6, background: "#E63946" }} />
        <div style={{ position: "absolute", left: 9.5,  top: 21.2, width: 13.0, height: 2.6, background: "#E63946" }} />
        <div style={{ position: "absolute", left: 10.8, top: 23.8, width: 10.4, height: 1.3, background: "#E63946" }} />
        <div style={{ position: "absolute", left: 12.1, top: 25.1, width: 7.8,  height: 1.3, background: "#E63946" }} />
        {/* Seeds */}
        <div style={{ position: "absolute", left: 12.1, top: 13.4, width: 1.3,  height: 1.3, background: "#FFE59A" }} />
        <div style={{ position: "absolute", left: 17.3, top: 13.4, width: 1.3,  height: 1.3, background: "#FFE59A" }} />
        <div style={{ position: "absolute", left: 14.7, top: 16.0, width: 1.3,  height: 1.3, background: "#FFE59A" }} />
        <div style={{ position: "absolute", left: 12.1, top: 18.6, width: 1.3,  height: 1.3, background: "#FFE59A" }} />
        <div style={{ position: "absolute", left: 17.3, top: 18.6, width: 1.3,  height: 1.3, background: "#FFE59A" }} />
        <div style={{ position: "absolute", left: 14.7, top: 21.2, width: 1.3,  height: 1.3, background: "#FFE59A" }} />
      </div>
    ),
    size,
  );
}
