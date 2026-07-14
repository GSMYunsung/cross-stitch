import { CROSSTITCH_DEFAULT_COLOR } from "../constant";
import { StitchCell } from "../types/crossTitch";

interface CheckedCell {
  r: number;
  c: number;
  color: string;
}

export const RESET_THRESHOLD = 0.3;
export const RESET_MIN_COUNT = 10;

// 그리드에서 랜덤하게 칸 제거 (클라이언트 복원 시)
export function applyRandomRemovalGrid(
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

// 체크된 셀 배열에서 랜덤 제거 (크론 서버사이드)
export function applyRandomRemovalCells(
  cells: CheckedCell[],
  removeCount: number,
): CheckedCell[] {
  if (removeCount <= 0 || cells.length === 0) return cells;
  const shuffled = [...cells];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(removeCount);
}

// 30% 드롭 여부 (크론 기준: savedCount >= 10)
export function shouldFullReset(savedCount: number, currentCount: number): boolean {
  return savedCount >= RESET_MIN_COUNT && currentCount <= savedCount * RESET_THRESHOLD;
}

// 클라이언트 복원 카드 숨김 여부
export function isDroppedBelowThreshold(savedCount: number, currentCount: number): boolean {
  return savedCount > 0 && currentCount <= savedCount * RESET_THRESHOLD;
}

