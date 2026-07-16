import type { SavedGridData } from "../hooks/useGridPersistence";
import { GAME_MODE, GameMode } from "../types/crossTitch";
import { isDroppedBelowThreshold } from "./gridLogic";

export interface HomeStateInput {
  isGridLoaded: boolean;
  savedGridData: SavedGridData | null;
  restoreChoice: "restore" | "fresh" | null;
  modeChoice: GameMode | null;
  /** commitInfo?.total_count — isResetThreshold·adjustedGrid 계산에 사용 */
  currentCommitCount: number;
  /** AuthProvider effectiveCommitCount — 0커밋 빈 상태 화면 표시에 사용 */
  effectiveCommitCount: number;
  resetDismissed: boolean;
}

export interface HomeStateResult {
  hasSavedGrid: boolean;
  waitingForChoice: boolean;
  effectiveMode: GameMode | null;
  shouldRestore: boolean;
  waitingForMode: boolean;
  showResetModal: boolean;
  showNoCommits: boolean;
  isResetThreshold: boolean;
}

export function deriveHomeState({
  isGridLoaded,
  savedGridData,
  restoreChoice,
  modeChoice,
  currentCommitCount,
  effectiveCommitCount,
  resetDismissed,
}: HomeStateInput): HomeStateResult {
  const hasActualStitches =
    savedGridData?.gridState.flat().some((c) => c.isChecked) ?? false;
  const hasSavedGrid = isGridLoaded && savedGridData !== null && hasActualStitches;

  const savedCount = savedGridData?.commitCount ?? 0;
  const isResetThreshold =
    savedGridData?.mode !== GAME_MODE.NORMAL &&
    isDroppedBelowThreshold(savedCount, currentCommitCount);

  const waitingForChoice =
    hasSavedGrid && restoreChoice === null && !savedGridData?.wasReset;

  const effectiveMode: GameMode | null = (() => {
    if (restoreChoice === "restore") return savedGridData?.mode ?? GAME_MODE.CHALLENGE;
    if (savedGridData?.wasReset) return savedGridData?.mode ?? GAME_MODE.CHALLENGE;
    if (isResetThreshold && hasSavedGrid) return savedGridData!.mode ?? GAME_MODE.CHALLENGE;
    if (restoreChoice === "fresh") return modeChoice;
    if (savedGridData?.mode !== undefined) return savedGridData.mode;
    return modeChoice;
  })();

  const shouldRestore = restoreChoice === "restore" || (isResetThreshold && hasSavedGrid);
  const waitingForMode =
    effectiveMode === null && !waitingForChoice && !savedGridData?.wasReset;
  const showResetModal = !!(savedGridData?.wasReset && !resetDismissed);
  // effectiveCommitCount: AuthProvider가 관리하는 값 (commitInfo.total_count와 다를 수 있음)
  const showNoCommits =
    effectiveMode === GAME_MODE.CHALLENGE && effectiveCommitCount === 0 && !shouldRestore;

  return {
    hasSavedGrid,
    waitingForChoice,
    effectiveMode,
    shouldRestore,
    waitingForMode,
    showResetModal,
    showNoCommits,
    isResetThreshold,
  };
}

/** Header 표시 여부 — user 없거나 /login 경로이면 숨긴다 */
export function isHeaderVisible(
  user: { uid: string } | null,
  pathname: string,
): boolean {
  return !!user && pathname !== "/login";
}
