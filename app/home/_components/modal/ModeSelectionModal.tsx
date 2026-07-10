"use client";

import { MODE_LIST } from "@/app/src/config/modes";
import { GameMode } from "@/app/src/types/crossTitch";

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

          {MODE_LIST.map((m) => (
            <button
              key={m.id}
              onClick={() => onSelect(m.id)}
              className="text-left p-4 cursor-pointer transition-all relative"
              style={{ border: `1.5px solid ${m.label.color}`, background: "#FDFCFA" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#F5F0F0";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `3px 3px 0 ${m.label.color}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = "#FDFCFA";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              {m.label.badge && (
                <div
                  className="absolute top-2 right-2 font-label text-[8px] px-1.5 py-0.5"
                  style={{ background: m.label.color, color: "#fff" }}
                >
                  {m.label.badge}
                </div>
              )}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg">{m.label.icon}</span>
                <span className="font-label text-[10px]" style={{ color: m.label.color }}>
                  {m.label.en}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
                {m.content.selectionDesc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
