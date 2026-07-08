"use client";

import { useState } from "react";
import { Template, TEMPLATES, templateToGrid } from "@/app/src/data/templates";
import { useAuthInfo } from "@/app/src/providers/AuthProvider";
import { GAME_MODE } from "@/app/src/types/crossTitch";
import { useStitch } from "@/app/src/providers/StitchProvider";

function TemplatePreview({ cells }: { cells: Template["cells"] }) {
  return (
    <svg
      width="90"
      height="90"
      viewBox="0 0 20 20"
      className="block"
      style={{ background: "#0a0a18", borderRadius: 10 }}
    >
      {cells.map(({ r, c, color }) => (
        <rect
          key={`${r}-${c}`}
          x={c + 0.08}
          y={r + 0.08}
          width={0.84}
          height={0.84}
          fill={color}
          rx={0.12}
        />
      ))}
    </svg>
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortage {
  templateName: string;
  need: number;
  have: number;
}

export function TemplateModal({ isOpen, onClose }: Props) {
  const { updateGridSate, mode } = useStitch();
  const { effectiveCommitCount: commitLimit } = useAuthInfo();
  const [shortage, setShortage] = useState<Shortage | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setShortage(null);
    onClose();
  };

  const handleSelect = (template: Template) => {
    if (mode === GAME_MODE.CHALLENGE && template.cells.length > commitLimit) {
      setShortage({
        templateName: `${template.emoji} ${template.name}`,
        need: template.cells.length,
        have: commitLimit,
      });
      return;
    }
    updateGridSate(templateToGrid(template.cells));
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,9,30,0.85)", backdropFilter: "blur(12px)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 상단: 퍼플 헤더 */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ background: "linear-gradient(135deg, #7C3AED, #5B21B6)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-white font-black">✦</span>
            <h2 className="text-white font-black text-sm">템플릿 선택</h2>
          </div>
          <button
            onClick={handleClose}
            className="font-bold text-lg leading-none cursor-pointer"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            ✕
          </button>
        </div>

        {/* 하단: 화이트 콘텐츠 */}
        <div className="bg-white px-5 pt-4 pb-5">
          <p className="text-xs font-semibold mb-4" style={{ color: "#8B8BA0" }}>
            클릭하면 현재 그리드에 바로 적용돼요. 기존 작업은 덮어써져요.
          </p>

          {/* 커밋 부족 경고 */}
          {shortage && (
            <div
              className="mb-4 px-4 py-3 rounded-2xl"
              style={{ background: "#FFF7ED", border: "1.5px solid #FED7AA" }}
            >
              <p className="text-xs font-black mb-0.5" style={{ color: "#C2410C" }}>
                {shortage.templateName} 템플릿은 커밋 {shortage.need}개가 필요해요
              </p>
              <p className="text-xs" style={{ color: "#EA580C" }}>
                현재 {shortage.have}개 보유 · {shortage.need - shortage.have}개 부족
              </p>
            </div>
          )}

          {/* 템플릿 그리드 */}
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {TEMPLATES.map((template) => {
              const isInsufficient =
                mode === GAME_MODE.CHALLENGE && template.cells.length > commitLimit;

              return (
                <button
                  key={template.id}
                  onClick={() => handleSelect(template)}
                  className="flex flex-col items-center gap-2 p-2.5 rounded-2xl transition-all cursor-pointer"
                  style={{
                    border: `2px solid ${isInsufficient ? "#F3F4F6" : "#EDE9FE"}`,
                    background: isInsufficient ? "#FAFAFA" : "#FAFAFE",
                    opacity: isInsufficient ? 0.45 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isInsufficient) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#7C3AED";
                      (e.currentTarget as HTMLButtonElement).style.background = "#F5F3FF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isInsufficient) {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "#EDE9FE";
                      (e.currentTarget as HTMLButtonElement).style.background = "#FAFAFE";
                    }
                  }}
                >
                  <TemplatePreview cells={template.cells} />
                  <span
                    className="text-xs font-bold"
                    style={{ color: isInsufficient ? "#C4C4D4" : "#5B21B6" }}
                  >
                    {template.emoji} {template.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
