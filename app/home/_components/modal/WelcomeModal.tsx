"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onStart: () => void;
}

const MODES = {
  normal: {
    icon: "🎨",
    label: "NORMAL MODE",
    color: "#3B9A3B",
    title: "자유롭게 창작하는 모드",
    desc: "커밋 수와 관계없이 원하는 만큼 칸을 채울 수 있어요. 칸이 줄어들거나 초기화되지 않아 편하게 작업할 수 있어요.",
    bullets: [
      { ok: true,  text: "칸 수 제한 없음" },
      { ok: true,  text: "커밋 감소해도 영향 없음" },
      { ok: true,  text: "언제든 자유롭게" },
    ],
  },
  challenge: {
    icon: "⚔️",
    label: "CHALLENGE MODE",
    color: "#C41E3A",
    title: "GitHub 커밋과 연동되는 모드",
    desc: "이번 달 커밋 수만큼만 칸을 쓸 수 있어요. 커밋이 줄어들면 십자수도 함께 줄어들어요.",
    bullets: [
      { ok: true,  text: "커밋 1개 = 픽셀 1칸" },
      { ok: false, text: "커밋 감소 시 칸 제거됨" },
      { ok: true,  text: "GitHub 활동이 작품이 됨" },
    ],
  },
} as const;

type ModeKey = keyof typeof MODES;

export function WelcomeModal({ isOpen, onStart }: Props) {
  const [active, setActive] = useState<ModeKey>("normal");
  const mode = MODES[active];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(245,238,230,0.95)", backdropFilter: "blur(4px)" }}
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
          {(["normal", "challenge"] as ModeKey[]).map((key) => {
            const m = MODES[key];
            const isActive = active === key;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-3 cursor-pointer font-label text-[10px] transition-all"
                style={{
                  background: isActive ? m.color : "#FDFCFA",
                  color: isActive ? "#FFFFFF" : "#7A7A7A",
                  borderRight: key === "normal" ? "1.5px solid #1A1A1A" : "none",
                }}
              >
                <span>{m.icon}</span>
                <span>{key === "normal" ? "일반" : "도전"}</span>
              </button>
            );
          })}
        </div>

        {/* 모드 설명 */}
        <div className="px-5 py-4" style={{ minHeight: 160 }}>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="font-label text-[9px] px-2 py-0.5"
              style={{ background: mode.color, color: "#fff" }}
            >
              {mode.label}
            </span>
          </div>
          <p className="text-sm font-bold mb-2" style={{ color: "#1A1A1A" }}>
            {mode.title}
          </p>
          <p className="text-xs leading-relaxed mb-4" style={{ color: "#7A7A7A" }}>
            {mode.desc}
          </p>
          <div className="flex flex-col gap-1.5">
            {mode.bullets.map((b, i) => (
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
        <div className="px-5 pb-5" style={{ borderTop: "1.5px solid #E8E2DA", paddingTop: 16 }}>
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
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "1px 1px 0 #C41E3A";
              (e.currentTarget as HTMLButtonElement).style.transform = "translate(2px, 2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #C41E3A";
              (e.currentTarget as HTMLButtonElement).style.transform = "none";
            }}
          >
            모드 선택하기 →
          </button>
        </div>
      </div>
    </div>
  );
}
