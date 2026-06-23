"use client";

import BackPressHandler from "@/app/src/components/BackPressHandler";
import { CROSSTITCH_DEFAULT_COLOR } from "@/app/src/constant";
import { clearResetFlag } from "@/app/src/hooks/useGridPersistence";
import { useAuthInfo } from "@/app/src/providers/AuthProvider";
import { StitchProvider } from "@/app/src/providers/StitchProvider";
import { StitchCell } from "@/app/src/types/crossTitch";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import CrossStitchEditor from "./CrossStitchEditor";
import { ResetNotificationModal } from "./modal/ResetNotificationModal";

function applyRandomRemoval(
  grid: StitchCell[][],
  removeCount: number,
): StitchCell[][] {
  const next = grid.map((row) => row.map((cell) => ({ ...cell })));
  const checkedPositions: [number, number][] = [];

  for (let r = 0; r < next.length; r++)
    for (let c = 0; c < next[r].length; c++)
      if (next[r][c].isChecked) checkedPositions.push([r, c]);

  for (let i = checkedPositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [checkedPositions[i], checkedPositions[j]] = [
      checkedPositions[j],
      checkedPositions[i],
    ];
  }

  for (const [r, c] of checkedPositions.slice(0, removeCount))
    next[r][c] = { color: CROSSTITCH_DEFAULT_COLOR, isChecked: false };

  return next;
}

export default function HomeContent() {
  const { savedGridData, commitInfo, isGridLoaded, user, effectiveCommitCount } = useAuthInfo();
  const [restoreChoice, setRestoreChoice] = useState<
    "restore" | "fresh" | null
  >(null);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  const [resetDismissed, setResetDismissed] = useState(false);

  const hasSavedGrid = isGridLoaded && savedGridData !== null;
  // wasReset인 경우 복원 선택 카드를 건너뜀
  const waitingForChoice = hasSavedGrid && restoreChoice === null && !savedGridData?.wasReset;
  const showResetModal = !!(savedGridData?.wasReset && !resetDismissed);

  const handleResetModalClose = () => {
    setResetDismissed(true);
    if (user?.uid) clearResetFlag(user.uid);
  };

  // Firebase Storage에서 저장된 이미지 URL 가져오기
  useEffect(() => {
    if (!hasSavedGrid || !user?.uid) return;
    const storage = getStorage();
    const imageRef = ref(storage, `images/${user.uid}.png`);
    getDownloadURL(imageRef)
      .then((url) => setSavedImageUrl(url))
      .catch(() => setSavedImageUrl(null));
  }, [hasSavedGrid, user?.uid]);

  const { adjustedGrid, wasAdjusted } = useMemo(() => {
    if (!savedGridData || restoreChoice !== "restore")
      return { adjustedGrid: undefined, wasAdjusted: false };

    const currentCount = commitInfo?.total_count ?? 0;
    const diff = savedGridData.commitCount - currentCount;

    if (diff <= 0)
      return { adjustedGrid: savedGridData.gridState, wasAdjusted: false };

    return {
      adjustedGrid: applyRandomRemoval(savedGridData.gridState, diff),
      wasAdjusted: true,
    };
  }, [savedGridData, commitInfo, restoreChoice]);

  // 로딩 중
  if (!isGridLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 커밋 0개 + 보너스 만료 → 빈 상태 안내
  if (effectiveCommitCount === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center text-center max-w-xs gap-5 px-4">
          <div className="text-5xl">🌱</div>
          <div>
            <p className="text-white font-semibold text-lg mb-2">
              이번 주 커밋이 없어요
            </p>
            <p className="text-slate-500 text-sm leading-relaxed">
              최근 7일 안에 GitHub에 코드를 올리면
              <br />
              그 수만큼 십자수 칸이 채워져요.
            </p>
          </div>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg border border-[#2a2a3a] text-slate-400
              hover:text-slate-200 hover:border-[#3a3a4a] transition-all text-sm"
          >
            GitHub 바로가기 →
          </a>
        </div>
      </div>
    );
  }

  // 이전 십자수가 있고 아직 선택 안 한 경우 → 복원 확인 카드
  if (waitingForChoice) {
    const checkedCount = savedGridData!.gridState
      .flat()
      .filter((c) => c.isChecked).length;

    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="bg-[#13131a] border border-[#1e1e2a] rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
          <div className="p-6 pb-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-indigo-400">✦</span>
              <span className="text-white font-semibold text-sm">
                이전 작업이 있어요
              </span>
            </div>

            {/* 저장된 이미지 미리보기 */}
            <div className="rounded-xl overflow-hidden bg-[#0d0d12] border border-[#1e1e2a] mb-4 flex items-center justify-center min-h-[140px]">
              {savedImageUrl ? (
                <Image
                  src={savedImageUrl}
                  alt="이전 십자수"
                  width={320}
                  height={320}
                  className="w-full object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 py-8">
                  <div className="w-5 h-5 border-2 border-indigo-500/50 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-600 text-xs">미리보기 로딩 중</p>
                </div>
              )}
            </div>

            <p className="text-slate-500 text-xs mb-3">
              {checkedCount}칸 채워진 십자수 ·{" "}
              {new Date(savedGridData!.updatedAt).toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
              })}{" "}
              저장됨
            </p>

            <p className="text-slate-400 text-sm leading-relaxed">
              이전에 저장한 십자수를 불러올까요?
            </p>
          </div>

          <div className="flex gap-3 p-4 pt-0">
            <button
              onClick={() => setRestoreChoice("fresh")}
              className="flex-1 py-2.5 rounded-lg border border-[#2a2a3a] text-slate-400
                hover:text-slate-200 hover:border-[#3a3a4a] transition-all text-sm cursor-pointer"
            >
              새로 시작
            </button>
            <button
              onClick={() => setRestoreChoice("restore")}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500
                text-white font-medium text-sm transition-all cursor-pointer"
            >
              불러오기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <StitchProvider initialGrid={adjustedGrid}>
      <CrossStitchEditor wasAdjusted={wasAdjusted} />
      <BackPressHandler />
      <ResetNotificationModal isOpen={showResetModal} onClose={handleResetModalClose} />
    </StitchProvider>
  );
}
