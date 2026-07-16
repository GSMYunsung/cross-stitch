"use client";

import BackPressHandler from "@/app/src/components/BackPressHandler";
import { clearResetFlag } from "@/app/src/hooks/useGridPersistence";
import { useAuthInfo } from "@/app/src/providers/AuthProvider";
import { StitchProvider } from "@/app/src/providers/StitchProvider";
import { GAME_MODE, GameMode } from "@/app/src/types/crossTitch";
import { applyRandomRemovalGrid as applyRandomRemoval } from "@/app/src/utils/gridLogic";
import { deriveHomeState } from "@/app/src/utils/homeState";
import { getDownloadURL, getStorage, ref } from "firebase/storage";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import CrossStitchEditor from "./CrossStitchEditor";
import { ModeSelectionModal } from "./modal/ModeSelectionModal";
import { ResetNotificationModal } from "./modal/ResetNotificationModal";
import { WelcomeModal } from "./modal/WelcomeModal";

export default function HomeContent() {
  const {
    savedGridData, commitInfo, isGridLoaded, user,
    effectiveCommitCount, updateMode,
  } = useAuthInfo();

  const [restoreChoice, setRestoreChoice] = useState<"restore" | "fresh" | null>(null);
  const [modeChoice, setModeChoice] = useState<GameMode | null>(null);
  const [savedImageUrl, setSavedImageUrl] = useState<string | null>(null);
  const [resetDismissed, setResetDismissed] = useState(false);
  const [showModeChange, setShowModeChange] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [welcomeDismissed, setWelcomeDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem("crossstitch-welcome-seen") === "true"
  );

  const handleModeSelect = (mode: GameMode) => {
    updateMode(mode);
    setModeChoice(mode);
  };

  const handleModeChange = (newMode: GameMode) => {
    updateMode(newMode);
    setModeChoice(newMode);
    setRestoreChoice("fresh");
    setEditorKey((k) => k + 1);
    setShowModeChange(false);
  };

  const handleRestore = () => {
    setRestoreChoice("restore");
  };

  const handleFreshStart = () => {
    setRestoreChoice("fresh");
  };

  const currentCount = commitInfo?.total_count ?? 0;

  const {
    hasSavedGrid,
    waitingForChoice,
    effectiveMode,
    shouldRestore,
    waitingForMode,
    showResetModal,
    showNoCommits,
  } = deriveHomeState({
    isGridLoaded,
    savedGridData,
    restoreChoice,
    modeChoice,
    currentCommitCount: currentCount,
    effectiveCommitCount,
    resetDismissed,
  });

  const handleResetModalClose = () => {
    setResetDismissed(true);
    if (user?.uid) clearResetFlag(user.uid);
  };

  useEffect(() => {
    if (!hasSavedGrid || !user?.uid) return;
    const storage = getStorage();
    const imageRef = ref(storage, `images/${user.uid}.png`);
    getDownloadURL(imageRef).then(setSavedImageUrl).catch(() => setSavedImageUrl(null));
  }, [hasSavedGrid, user?.uid]);

  const { adjustedGrid, wasAdjusted } = useMemo(() => {
    if (!savedGridData || !shouldRestore) return { adjustedGrid: undefined, wasAdjusted: false };
    if (savedGridData.mode === GAME_MODE.NORMAL) return { adjustedGrid: savedGridData.gridState, wasAdjusted: false };
    const diff = savedGridData.commitCount - currentCount;
    if (diff <= 0) return { adjustedGrid: savedGridData.gridState, wasAdjusted: false };
    return { adjustedGrid: applyRandomRemoval(savedGridData.gridState, diff), wasAdjusted: true };
  }, [savedGridData, commitInfo, shouldRestore]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 로딩 ── */
  if (!isGridLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center" style={{ background: "#F5EEE6" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-2 border-t-transparent animate-spin"
            style={{ borderColor: "#D5CFC7", borderTopColor: "#1A1A1A" }}
          />
          <span className="font-label text-[10px]" style={{ color: "#7A7A7A" }}>
            LOADING...
          </span>
        </div>
      </div>
    );
  }

  /* ── 이전 작업 복원 선택 ── */
  if (waitingForChoice) {
    const checkedCount = savedGridData!.gridState.flat().filter((c) => c.isChecked).length;
    const savedMode = savedGridData!.mode;

    return (
      <div
        className="flex flex-1 items-center justify-center p-4"
        style={{ background: "#F5EEE6" }}
      >
        <div
          style={{
            background: "#FFFFFF",
            border: "2px solid #1A1A1A",
            boxShadow: "5px 5px 0 #1A1A1A",
            width: "100%",
            maxWidth: 360,
          }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderBottom: "1.5px solid #1A1A1A", background: "#1A1A1A" }}
          >
            <span className="font-label text-[11px]" style={{ color: "#FFFFFF" }}>
              SAVED WORK FOUND
            </span>
            {savedMode && (
              <span
                className="font-label text-[9px] px-2 py-0.5"
                style={{ background: savedMode === GAME_MODE.NORMAL ? "#3B9A3B" : "#C41E3A", color: "#fff" }}
              >
                {savedMode === GAME_MODE.NORMAL ? "NORMAL" : "CHALLENGE"}
              </span>
            )}
          </div>

          <div
            className="mx-4 mt-4 flex items-center justify-center"
            style={{
              background: "#D5CFC7",
              border: "1.5px solid #1A1A1A",
              minHeight: 140,
              padding: 2,
            }}
          >
            {savedImageUrl ? (
              <Image src={savedImageUrl} alt="저장된 십자수" width={320} height={320} className="w-full object-contain" />
            ) : (
              <div className="flex flex-col items-center gap-2 py-8">
                <div
                  className="w-5 h-5 border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#A09890", borderTopColor: "#1A1A1A" }}
                />
                <span className="font-label text-[9px]" style={{ color: "#7A7A7A" }}>
                  LOADING PREVIEW
                </span>
              </div>
            )}
          </div>

          <div className="px-4 pt-3 pb-1">
            <p className="font-label text-[9px]" style={{ color: "#7A7A7A" }}>
              {checkedCount} CELLS FILLED ·{" "}
              {new Date(savedGridData!.updatedAt).toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex gap-2 p-4">
            <button
              onClick={handleFreshStart}
              className="flex-1 py-2.5 cursor-pointer font-label text-[10px] transition-all"
              style={{ border: "1.5px solid #1A1A1A", background: "#FFFFFF", color: "#1A1A1A" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0E9E0"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF"; }}
            >
              새로 시작
            </button>
            <button
              onClick={handleRestore}
              className="flex-1 py-2.5 cursor-pointer font-label text-[10px] transition-all"
              style={{
                border: "1.5px solid #1A1A1A",
                background: "#1A1A1A",
                color: "#FFFFFF",
                boxShadow: "2px 2px 0 #C41E3A",
              }}
            >
              불러오기
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── 커밋 0개 빈 상태 ── */
  if (showNoCommits) {
    return (
      <div
        className="flex flex-1 items-center justify-center p-4"
        style={{ background: "#F5EEE6" }}
      >
        <div
          className="text-center"
          style={{
            background: "#FFFFFF",
            border: "2px solid #1A1A1A",
            boxShadow: "4px 4px 0 #1A1A1A",
            padding: "40px 32px",
            maxWidth: 320,
          }}
        >
          <div
            className="w-16 h-16 mx-auto mb-5 flex items-center justify-center"
            style={{ border: "2px solid #1A1A1A", background: "#F5EEE6" }}
          >
            <span className="text-3xl">🌱</span>
          </div>
          <p className="font-label text-[11px] mb-2" style={{ color: "#1A1A1A" }}>
            NO COMMITS THIS MONTH
          </p>
          <p className="text-sm leading-relaxed mb-5" style={{ color: "#7A7A7A" }}>
            최근 한 달 안에 GitHub에 코드를 올리면 그 수만큼 칸이 채워져요.
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="font-label text-[10px] px-5 py-2.5 transition-all"
            style={{
              display: "inline-block",
              border: "1.5px solid #1A1A1A",
              background: "#1A1A1A",
              color: "#FFFFFF",
            }}
          >
            GITHUB →
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <WelcomeModal
        isOpen={waitingForMode && !hasSavedGrid && !welcomeDismissed}
        onStart={() => {
          localStorage.setItem("crossstitch-welcome-seen", "true");
          setWelcomeDismissed(true);
        }}
      />
      <ModeSelectionModal
        isOpen={(waitingForMode && (hasSavedGrid || welcomeDismissed)) || showModeChange}
        onSelect={showModeChange ? handleModeChange : handleModeSelect}
      />
      {effectiveMode !== null && (
        <StitchProvider key={editorKey} initialGrid={adjustedGrid} mode={effectiveMode}>
          <CrossStitchEditor
            wasAdjusted={wasAdjusted}
            onModeChangeRequest={() => setShowModeChange(true)}
          />
          <BackPressHandler />
          <ResetNotificationModal isOpen={showResetModal} onClose={handleResetModalClose} />
        </StitchProvider>
      )}
    </>
  );
}
