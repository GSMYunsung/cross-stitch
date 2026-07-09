import { db } from "@/app/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  CROSSTITCH_DEFAULT_COLOR,
  CROSSTITCH_SPEC,
} from "@/app/src/constant";
import { GAME_MODE, GameMode, StitchCell } from "../types/crossTitch";

interface CheckedCell {
  r: number;
  c: number;
  color: string;
}

export interface SavedGridData {
  gridState: StitchCell[][];
  commitCount: number;
  updatedAt: string;
  firstLoginAt: string;
  githubUsername?: string;
  wasReset?: boolean;
  mode?: GameMode; // Firestore에 저장된 경우에만 존재 (모드 미선택 = undefined)
}

const makeBlankGrid = (): StitchCell[][] =>
  Array.from({ length: CROSSTITCH_SPEC }, () =>
    Array.from({ length: CROSSTITCH_SPEC }, () => ({
      color: CROSSTITCH_DEFAULT_COLOR,
      isChecked: false,
    })),
  );

// 최초 로그인 시 firstLoginAt 기록 (빈 문서 생성)
export const initFirstLogin = async (userId: string): Promise<string> => {
  const firstLoginAt = new Date().toISOString();
  const docRef = doc(db, "grids", userId);
  await setDoc(docRef, {
    checkedCells: [],
    commitCount: 0,
    updatedAt: firstLoginAt,
    firstLoginAt,
  });
  return firstLoginAt;
};

export const saveGrid = async (
  userId: string,
  gridState: StitchCell[][],
  commitCount: number,
  mode: GameMode,
): Promise<void> => {
  const checkedCells: CheckedCell[] = [];
  gridState.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell.isChecked) checkedCells.push({ r, c, color: cell.color });
    }),
  );

  const docRef = doc(db, "grids", userId);
  await setDoc(
    docRef,
    {
      checkedCells,
      commitCount,
      mode,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
};

export const saveMode = async (userId: string, mode: GameMode): Promise<void> => {
  const docRef = doc(db, "grids", userId);
  await setDoc(docRef, { mode }, { merge: true });
};

export const clearResetFlag = async (userId: string): Promise<void> => {
  const docRef = doc(db, "grids", userId);
  await setDoc(docRef, { wasReset: false }, { merge: true });
};


export const loadGrid = async (
  userId: string,
): Promise<SavedGridData | null> => {
  const docRef = doc(db, "grids", userId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  const grid = makeBlankGrid();

  // checkedCells 가 없는 경우 빈 배열로 안전하게 처리
  for (const { r, c, color } of (data.checkedCells ?? []) as CheckedCell[]) {
    grid[r][c] = { color, isChecked: true };
  }

  return {
    gridState: grid,
    commitCount: data.commitCount ?? 0,
    updatedAt: data.updatedAt ?? "",
    firstLoginAt: data.firstLoginAt ?? data.updatedAt ?? "",
    githubUsername: data.githubUsername ?? undefined,
    wasReset: data.wasReset ?? false,
    mode: data.mode as GameMode | undefined,
  };
};
