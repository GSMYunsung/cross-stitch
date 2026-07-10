"use client";

import { MODE_LIST } from "@/app/src/config/modes";
import { GameMode } from "@/app/src/types/crossTitch";
import { useState } from "react";

interface Props {
  isOpen: boolean;
  onStart: () => void;
}

export function WelcomeModal({ isOpen, onStart }: Props) {
  const [activeId, setActiveId] = useState<GameMode>(MODE_LIST[0].id);
  const mode = MODE_LIST.find((m) => m.id === activeId) ?? MODE_LIST[0];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(245,238,230,0.95)",
        backdropFilter: "blur(4px)",
      }}
    >
      <div
        style={{
          background: "#FFFFFF",
          border: "2px solid #1A1A1A",
          boxShadow: "7px 7px 0 #1A1A1A",
          width: "100%",
          maxWidth: 400,
        }}
      >
        {/* 헤더 */}
        <div
          className="px-5 py-4"
          style={{ background: "#1A1A1A", borderBottom: "2px solid #1A1A1A" }}
        >
          <span className="font-label text-[11px]" style={{ color: "#FFFFFF" }}>
            STITCH.COMMIT
          </span>
          <p className="text-xs mt-1" style={{ color: "#A09890" }}>
            GitHub 커밋으로 만드는 픽셀 아트 십자수
          </p>
        </div>

        {/* 모드 탭 */}
        <div className="flex" style={{ borderBottom: "1.5px solid #1A1A1A" }}>
          {MODE_LIST.map((m, idx) => {
            const isActive = activeId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveId(m.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 cursor-pointer font-label text-[10px] transition-all"
                style={{
                  background: isActive ? m.label.color : "#FDFCFA",
                  color: isActive ? "#FFFFFF" : "#7A7A7A",
                  borderRight: idx < MODE_LIST.length - 1 ? "1.5px solid #1A1A1A" : "none",
                }}
              >
                <span>{m.label.icon}</span>
                <span>{m.label.ko.replace(" 모드", "")}</span>
              </button>
            );
          })}
        </div>

        {/* 모드 설명 */}
        <div className="px-5 py-4" style={{ minHeight: 160 }}>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="font-label text-[9px] px-2 py-0.5"
              style={{ background: mode.label.color, color: "#fff" }}
            >
              {mode.label.en}
            </span>
          </div>
          <p className="text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
            {mode.content.title}
          </p>
          <p
            className="text-xs leading-relaxed mb-4"
            style={{ color: "#7A7A7A" }}
          >
            {mode.content.desc}
          </p>
          <div className="flex flex-col gap-1.5">
            {mode.content.bullets.map((b, i) => (
              <div key={i} className="flex items-center gap-2">
                <span
                  className="font-label text-[9px] w-4 text-center flex-shrink-0"
                  style={{ color: b.ok ? "#3B9A3B" : "#C41E3A" }}
                >
                  {b.ok ? "✓" : "!"}
                </span>
                <span className="text-xs" style={{ color: "#7A7A7A" }}>
                  {b.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div
          className="px-5 pb-5"
          style={{ borderTop: "1.5px solid #E8E2DA", paddingTop: 16 }}
        >
          <p className="text-xs mb-4" style={{ color: "#7A7A7A" }}>
            모드는 에디터에서 언제든지 변경할 수 있어요.
          </p>
          <button
            onClick={onStart}
            className="w-full py-3 font-label text-[10px] cursor-pointer transition-all"
            style={{
              background: "#1A1A1A",
              border: "1.5px solid #1A1A1A",
              color: "#FFFFFF",
              boxShadow: "3px 3px 0 #C41E3A",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "1px 1px 0 #C41E3A";
              (e.currentTarget as HTMLButtonElement).style.transform =
                "translate(2px, 2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow =
                "3px 3px 0 #C41E3A";
              (e.currentTarget as HTMLButtonElement).style.transform = "none";
            }}
          >
            확인했어요 →
          </button>
        </div>
      </div>
    </div>
  );
}
