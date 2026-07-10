"use client";

import CrossTitch from "@/app/src/components/CrossTitch";
import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { saveGrid } from "@/app/src/hooks/useGridPersistence";
import { useAuthInfo } from "@/app/src/providers/AuthProvider";
import { useStitch } from "@/app/src/providers/StitchProvider";
import { CROSSTITCH_DEFAULT_SELECT_COLOR } from "@/app/src/constant";
import { GAME_MODE } from "@/app/src/types/crossTitch";
import { Template, TEMPLATES, templateToGrid } from "@/app/src/data/templates";
import { useEffect, useRef, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { CrossStitchResultModal } from "./modal/CrossStitchResultModal";
import OnboardingModal from "./OnboardingModal";

const PRESET_COLORS = ["#C41E3A", "#C9971A", "#3B9A3B", "#1A1A1A", "#FFFFFF"];

interface TemplateThumbnailProps {
  template: Template;
  isLocked: boolean;
  isSelected: boolean;
  onClick: () => void;
}

function TemplateThumbnail({ template, isLocked, isSelected, onClick }: TemplateThumbnailProps) {
  const [hovered, setHovered] = useState(false);
  const active = hovered && !isLocked && !isSelected;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className="relative flex flex-col items-center cursor-pointer"
      style={{ opacity: isLocked ? 0.45 : 1 }}
      title={isLocked ? `커밋 ${template.cells.length}개 필요` : template.name}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        style={{
          border: isSelected ? "2px solid #C41E3A" : "1.5px solid #1A1A1A",
          background: "#FDFCFA",
          padding: 4,
          borderRadius: 2,
          width: "100%",
          aspectRatio: "1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          boxShadow: active ? "3px 3px 0 #1A1A1A" : "none",
          transform: active ? "translate(-1px, -1px)" : "none",
          transition: "box-shadow 0.1s, transform 0.1s",
        }}
      >
        <svg
          width="72"
          height="72"
          viewBox="0 0 20 20"
          style={{ display: "block" }}
        >
          <rect width="20" height="20" fill="#FDFCFA" />
          {template.cells.map(({ r, c, color }) => (
            <rect
              key={`${r}-${c}`}
              x={c}
              y={r}
              width={1}
              height={1}
              fill={color}
            />
          ))}
        </svg>
        {isLocked && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "rgba(245,238,230,0.85)" }}
          >
            <span
              className="font-label text-[9px]"
              style={{ color: "#7A7A7A" }}
            >
              LOCKED
            </span>
          </div>
        )}
        {isSelected && (
          <div
            className="absolute top-1 right-1 w-3 h-3 flex items-center justify-center"
            style={{ background: "#C41E3A", borderRadius: 1 }}
          >
            <span style={{ color: "#fff", fontSize: 8, fontWeight: 900 }}>✓</span>
          </div>
        )}
      </div>
      <span
        className="font-label text-[9px] mt-1 truncate w-full text-center"
        style={{ color: "#7A7A7A" }}
      >
        {template.emoji} {template.name}
      </span>
    </button>
  );
}

interface Props {
  wasAdjusted?: boolean;
  onModeChangeRequest: () => void;
}

export default function CrossStitchEditor({ wasAdjusted = false, onModeChangeRequest }: Props) {
  const { handleUpload } = useFile();
  const { user } = useAuth();
  const { commitInfo, effectiveCommitCount: commitLimit } = useAuthInfo();
  const {
    hasCheckedItem,
    updateSelectColor,
    resetGridState,
    updateGridSate,
    gridState,
    checkedCount,
    mode,
    paletteHistory,
  } = useStitch();

  const [modal, setModal] = useState(false);
  const [color, setColor] = useColor(CROSSTITCH_DEFAULT_SELECT_COLOR);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [showColorInputs, setShowColorInputs] = useState(false);
  const autoUploadDone = useRef(false);

  useEffect(() => {
    if (!wasAdjusted || !user?.uid || autoUploadDone.current) return;
    autoUploadDone.current = true;
    const timer = setTimeout(async () => {
      const data = await handleUpload(user.uid);
      if (data?.metadata) {
        await saveGrid(user.uid, gridState, commitInfo?.total_count ?? 0, mode);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = async () => {
    if (!user?.uid) return;
    setIsUploading(true);
    try {
      await Promise.all([
        saveGrid(user.uid, gridState, commitInfo?.total_count ?? 0, mode),
        handleUpload(user.uid).catch(console.error),
      ]);
      setModal(true);
    } catch (error) {
      console.error("저장 중 오류 발생:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    if (mode === GAME_MODE.CHALLENGE && template.cells.length > commitLimit) {
      setTemplateError(
        `커밋 ${template.cells.length - commitLimit}개 부족`
      );
      setTimeout(() => setTemplateError(null), 2500);
      return;
    }
    setTemplateError(null);
    setSelectedTemplateId(template.id);
    updateGridSate(templateToGrid(template.cells));
  };

  const canComplete = hasCheckedItem() && !isUploading;

  return (
    <div
      className="flex flex-1 flex-col min-h-0"
      style={{ background: "#F5EEE6" }}
    >
      <OnboardingModal />

      <div className="flex flex-1 gap-4 p-4 overflow-auto justify-center">

        <div className="flex flex-col gap-3 flex-shrink-0 w-[250px] self-start sticky top-4">

          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #1A1A1A",
              padding: "14px",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-pixel" style={{ color: "#1A1A1A" }}>
                COLOR PICKER
              </span>
              <button
                onClick={() => setShowColorInputs((v) => !v)}
                className="font-label cursor-pointer transition-all"
                style={{ color: "#7A7A7A", fontSize: 10 }}
              >
                {showColorInputs ? "HEX/RGB ▲" : "HEX/RGB ▼"}
              </button>
            </div>

            <ColorPicker
              hideInput={!showColorInputs}
              color={color}
              onChange={(c) => {
                setColor(c);
                updateSelectColor(c.hex);
              }}
            />

            <div className="flex gap-2 mt-3">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    updateSelectColor(preset);
                    setColor({ ...color, hex: preset } as typeof color);
                  }}
                  className="cursor-pointer flex-1"
                  style={{
                    height: 28,
                    background: preset,
                    border:
                      color.hex?.toLowerCase() === preset.toLowerCase()
                        ? "2.5px solid #C41E3A"
                        : "1.5px solid #1A1A1A",
                    borderRadius: 2,
                    boxShadow:
                      color.hex?.toLowerCase() === preset.toLowerCase()
                        ? "2px 2px 0 #C41E3A"
                        : "none",
                    transition: "box-shadow 0.1s, transform 0.1s",
                  }}
                  onMouseEnter={(e) => {
                    if (color.hex?.toLowerCase() === preset.toLowerCase()) return;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #1A1A1A";
                    (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1px, -1px)";
                  }}
                  onMouseLeave={(e) => {
                    if (color.hex?.toLowerCase() === preset.toLowerCase()) return;
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLButtonElement).style.transform = "none";
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px dashed #C0BAB2",
              padding: "14px",
            }}
          >
            <span className="font-pixel block mb-3" style={{ color: "#7A7A7A" }}>
              PALETTE HISTORY
            </span>
            <div className="flex gap-2 flex-wrap">
              {paletteHistory.length === 0 ? (
                <span className="text-xs" style={{ color: "#C0BAB2" }}>
                  색상을 선택하면 기록돼요
                </span>
              ) : (
                paletteHistory.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      updateSelectColor(c);
                      setColor({ ...color, hex: c } as typeof color);
                    }}
                    className="w-7 h-7 cursor-pointer transition-all"
                    style={{
                      background: c,
                      border: "1.5px solid #1A1A1A",
                      borderRadius: 2,
                    }}
                    title={c}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 flex-1">
          <CrossTitch />

          {mode === GAME_MODE.CHALLENGE && (
            <div className="w-full max-w-[486px]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-label" style={{ color: "#1A1A1A" }}>
                  PROJECT PROGRESS
                </span>
                <span className="font-label" style={{ color: "#7A7A7A" }}>
                  {checkedCount} / {commitLimit} CELLS
                </span>
              </div>
              <div
                style={{
                  border: "1.5px solid #1A1A1A",
                  height: 20,
                  background: "#FDFCFA",
                  padding: "2px",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width:
                      commitLimit > 0
                        ? `${Math.min((checkedCount / commitLimit) * 100, 100)}%`
                        : "0%",
                    background: "#C9971A",
                    transition: "width 0.4s",
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={resetGridState}
              className="cursor-pointer font-label px-6 py-2.5 transition-all"
              style={{
                background: "#FFFFFF",
                border: "1.5px solid #1A1A1A",
                color: "#1A1A1A",
                borderRadius: 2,
                transition: "box-shadow 0.1s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #1A1A1A";
                (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1px, -1px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                (e.currentTarget as HTMLButtonElement).style.transform = "none";
              }}
            >
              초기화
            </button>

            <button
              onClick={handleComplete}
              disabled={!canComplete}
              className="cursor-pointer font-label px-8 py-2.5 transition-all"
              style={{
                background: canComplete ? "#C41E3A" : "#D5CFC7",
                border: `1.5px solid ${canComplete ? "#C41E3A" : "#C0BAB2"}`,
                color: canComplete ? "#FFFFFF" : "#A09890",
                borderRadius: 2,
                cursor: !canComplete ? "not-allowed" : "pointer",
                boxShadow: canComplete ? "3px 3px 0 #8B0000" : "none",
                transition: "box-shadow 0.1s, transform 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!canComplete) return;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "5px 5px 0 #8B0000";
                (e.currentTarget as HTMLButtonElement).style.transform = "translate(-1px, -1px)";
              }}
              onMouseLeave={(e) => {
                if (!canComplete) return;
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #8B0000";
                (e.currentTarget as HTMLButtonElement).style.transform = "none";
              }}
            >
              {isUploading ? "저장 중..." : "완성 →"}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-shrink-0 w-[250px] self-start sticky top-4">

          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #1A1A1A",
              padding: "14px",
            }}
          >
            <span className="font-pixel block mb-3" style={{ color: "#1A1A1A" }}>
              TEMPLATES
            </span>

            {templateError && (
              <div
                className="mb-3 px-2 py-1.5 font-label text-[9px]"
                style={{
                  background: "#FFF5F5",
                  border: "1px solid #C41E3A",
                  color: "#C41E3A",
                  borderRadius: 2,
                }}
              >
                {templateError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((template) => {
                const isLocked =
                  mode === GAME_MODE.CHALLENGE && template.cells.length > commitLimit;
                return (
                  <TemplateThumbnail
                    key={template.id}
                    template={template}
                    isLocked={isLocked}
                    isSelected={selectedTemplateId === template.id}
                    onClick={() => handleTemplateSelect(template)}
                  />
                );
              })}
            </div>
          </div>

          {mode === GAME_MODE.CHALLENGE && (
            <div
              style={{
                background: "#FEF9EC",
                border: "1.5px solid #C9971A",
                padding: "12px",
              }}
            >
              <span
                className="block mb-1.5 text-xs font-black"
                style={{ color: "#1A1A1A" }}
              >
                CHALLENGE MODE TIP
              </span>
              <p className="text-xs leading-relaxed" style={{ color: "#5A4A30" }}>
                커밋 한 개당 셀 한 칸을 쓸 수 있어요.
              </p>
            </div>
          )}

          {mode === GAME_MODE.NORMAL && (
            <div
              style={{
                background: "#FEF9EC",
                border: "1.5px solid #C9971A",
                padding: "12px",
              }}
            >
              <span
                className="block mb-1.5 text-xs font-black"
                style={{ color: "#1A1A1A" }}
              >
                FREE MODE TIP
              </span>
              <p className="text-xs leading-relaxed" style={{ color: "#5A4A30" }}>
                칸 수 제한 없이 자유롭게 채울 수 있어요.
              </p>
            </div>
          )}

          <button
            onClick={onModeChangeRequest}
            className="w-full py-2.5 font-label text-[10px] cursor-pointer transition-all"
            style={{
              border: "1.5px solid #D5CFC7",
              background: "#FDFCFA",
              color: "#7A7A7A",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#1A1A1A";
              (e.currentTarget as HTMLButtonElement).style.color = "#1A1A1A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#D5CFC7";
              (e.currentTarget as HTMLButtonElement).style.color = "#7A7A7A";
            }}
          >
            ⇄ 모드 변경
          </button>
        </div>
      </div>

      <CrossStitchResultModal isOpen={modal} onClose={() => setModal(false)} />
    </div>
  );
}
