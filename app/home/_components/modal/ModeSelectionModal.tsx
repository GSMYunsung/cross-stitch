"use client";

import { GAME_MODE, GameMode } from "@/app/src/types/crossTitch";

interface Props {
  isOpen: boolean;
  onSelect: (mode: GameMode) => void;
}

export function ModeSelectionModal({ isOpen, onSelect }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(245,238,230,0.92)", backdropFilter: "blur(4px)" }}
    >
      <div
        style={{
          background: "#FFFFFF",
          border: "2px solid #1A1A1A",
          boxShadow: "6px 6px 0 #1A1A1A",
          width: "100%",
          maxWidth: 360,
        }}
      >
        {/* 헤더 */}
        <div
          className="px-5 py-3"
          style={{ background: "#1A1A1A", borderBottom: "2px solid #1A1A1A" }}
        >
          <span className="font-label text-[11px]" style={{ color: "#FFFFFF" }}>
            SELECT MODE
          </span>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <p className="text-xs mb-1" style={{ color: "#7A7A7A" }}>
            나중에 변경할 수 없어요. 신중하게 선택하세요.
          </p>

          {/* 일반 모드 */}
          <button
            onClick={() => onSelect(GAME_MODE.NORMAL)}
            className="text-left p-4 cursor-pointer transition-all"
            style={{ border: "1.5px solid #1A1A1A", background: "#FDFCFA" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#F0E9E0";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #1A1A1A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#FDFCFA";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">🎨</span>
              <span className="font-label text-[10px]" style={{ color: "#1A1A1A" }}>
                NORMAL MODE
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
              커밋 수에 관계없이 자유롭게 채워요.
              칸이 줄어들거나 초기화되지 않아요.
            </p>
          </button>

          {/* 도전 모드 */}
          <button
            onClick={() => onSelect(GAME_MODE.CHALLENGE)}
            className="text-left p-4 cursor-pointer transition-all relative"
            style={{ border: "1.5px solid #C41E3A", background: "#FDFCFA" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#FFF5F5";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #C41E3A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "#FDFCFA";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            <div
              className="absolute top-2 right-2 font-label text-[8px] px-1.5 py-0.5"
              style={{ background: "#C41E3A", color: "#fff" }}
            >
              GITHUB 연동
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-lg">⚔️</span>
              <span className="font-label text-[10px]" style={{ color: "#C41E3A" }}>
                CHALLENGE MODE
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
              이번 달 커밋 수만큼 칸을 사용해요.
              커밋이 줄면 십자수도 함께 줄어들어요.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
