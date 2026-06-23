"use client";

import CrossTitch from "@/app/src/components/CrossTitch";
import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { saveGrid } from "@/app/src/hooks/useGridPersistence";
import { useAuthInfo } from "@/app/src/providers/AuthProvider";
import { useStitch } from "@/app/src/providers/StitchProvider";
import { CROSSTITCH_DEFAULT_SELECT_COLOR } from "@/app/src/constant";
import { useEffect, useRef, useState } from "react";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { CrossStitchResultModal } from "./modal/CrossStitchResultModal";
import OnboardingModal from "./OnboardingModal";

interface Props {
  wasAdjusted?: boolean;
}

export default function CrossStitchEditor({ wasAdjusted = false }: Props) {
  const { handleUpload } = useFile();
  const { user } = useAuth();
  const { commitInfo, effectiveCommitCount: commitLimit } = useAuthInfo();
  const { hasCheckedItem, updateSelectColor, resetGridState, gridState, checkedCount } =
    useStitch();

  const [modal, setModal] = useState(false);
  const [color, setColor] = useColor(CROSSTITCH_DEFAULT_SELECT_COLOR);
  const [isUploading, setIsUploading] = useState(false);
  const autoUploadDone = useRef(false);

  // 커밋 감소로 그리드가 조정된 경우 자동 업로드 + 저장
  useEffect(() => {
    if (!wasAdjusted || !user?.uid || autoUploadDone.current) return;
    autoUploadDone.current = true;

    const timer = setTimeout(async () => {
      const data = await handleUpload(user.uid);
      if (data?.metadata) {
        await saveGrid(user.uid, gridState, commitInfo?.total_count ?? 0);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleComplete = async () => {
    if (!user?.uid) return;
    setIsUploading(true);
    try {
      const data = await handleUpload(user.uid);
      if (data?.metadata) {
        await saveGrid(user.uid, gridState, commitInfo?.total_count ?? 0);
        setModal(true);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <OnboardingModal />

      <div className="flex flex-1 items-start justify-center gap-8 p-8 overflow-auto">
        {/* 색상 피커 패널 */}
        <div className="flex flex-col gap-4 sticky top-0">
          <div className="bg-[#13131a] border border-[#1e1e2a] rounded-xl p-4">
            <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
              색상 선택
            </p>
            <ColorPicker
              color={color}
              onChange={(c) => {
                setColor(c);
                updateSelectColor(c.hex);
              }}
            />
          </div>
        </div>

        {/* 그리드 영역 */}
        <div className="flex flex-col items-center gap-5">
          <CrossTitch />

          {/* 진행도 바 */}
          <div className="w-full max-w-sm">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-slate-500 text-xs">
                사용한 커밋
              </span>
              <span className="text-slate-300 text-xs font-medium">
                {checkedCount} / {commitLimit}
              </span>
            </div>
            <div className="h-1.5 bg-[#1e1e2a] rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{
                  width: commitLimit > 0
                    ? `${Math.min((checkedCount / commitLimit) * 100, 100)}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <button
              className="px-6 py-2.5 rounded-lg border border-[#2a2a3a] text-slate-400
                hover:text-slate-200 hover:border-[#3a3a4a] transition-all text-sm cursor-pointer"
              onClick={resetGridState}
            >
              초기화
            </button>
            <button
              className="px-6 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium
                hover:bg-indigo-500 active:bg-indigo-700
                disabled:bg-[#1e1e2a] disabled:text-slate-600 disabled:cursor-not-allowed
                transition-all cursor-pointer shadow-lg shadow-indigo-900/30 flex items-center gap-2"
              disabled={!hasCheckedItem() || isUploading}
              onClick={handleComplete}
            >
              {isUploading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  저장 중...
                </>
              ) : (
                "완성 →"
              )}
            </button>
          </div>
        </div>
      </div>

      <CrossStitchResultModal
        isOpen={modal}
        onClose={() => setModal(false)}
      />
    </div>
  );
}
