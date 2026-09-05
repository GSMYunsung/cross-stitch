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
  tempGridState?: StitchCell[][];
  tempCommitCount?: number;
  tempMode?: GameMode;
  commitCount: number;
  updatedAt: string;
  firstLoginAt: string;
  wasReset?: boolean;
  mode?: GameMode;
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

const LS_TEMP_KEY = "crossstitch-tempgrid";

export const saveTempGrid = async (
  userId: string,
  gridState: StitchCell[][],
  commitCount: number,
  mode: GameMode,
): Promise<void> => {
  const tempCheckedCells: CheckedCell[] = [];
  gridState.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell.isChecked) tempCheckedCells.push({ r, c, color: cell.color });
    }),
  );
  const docRef = doc(db, "grids", userId);
  await setDoc(
    docRef,
    {
      tempCheckedCells,
      tempCommitCount: commitCount,
      tempMode: mode,
      tempUpdatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(LS_TEMP_KEY, JSON.stringify({ cells: tempCheckedCells, commitCount, mode }));
  }
};

export const clearTempGrid = async (userId: string): Promise<void> => {
  const docRef = doc(db, "grids", userId);
  await setDoc(docRef, { tempCheckedCells: [], tempCommitCount: 0 }, { merge: true });
  if (typeof window !== "undefined") {
    localStorage.removeItem(LS_TEMP_KEY);
  }
};

export const loadLocalTempGrid = (): { tempGridState: StitchCell[][]; tempCommitCount: number; tempMode?: GameMode } | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LS_TEMP_KEY);
    if (!raw) return null;
    const { cells, commitCount, mode } = JSON.parse(raw) as { cells: CheckedCell[]; commitCount: number; mode?: GameMode };
    if (!cells || cells.length === 0) return null;
    const grid = makeBlankGrid();
    for (const { r, c, color } of cells) {
      grid[r][c] = { color, isChecked: true };
    }
    return { tempGridState: grid, tempCommitCount: commitCount, tempMode: mode };
  } catch {
    return null;
  }
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

  const tempCells = (data.tempCheckedCells ?? []) as CheckedCell[];
  let tempGridState: StitchCell[][] | undefined;
  if (tempCells.length > 0) {
    const tempGrid = makeBlankGrid();
    for (const { r, c, color } of tempCells) {
      tempGrid[r][c] = { color, isChecked: true };
    }
    tempGridState = tempGrid;
  }

  return {
    gridState: grid,
    tempGridState,
    tempCommitCount: data.tempCommitCount ?? undefined,
    tempMode: data.tempMode as GameMode | undefined,
    commitCount: data.commitCount ?? 0,
    updatedAt: data.updatedAt ?? "",
    firstLoginAt: data.firstLoginAt ?? data.updatedAt ?? "",
    wasReset: data.wasReset ?? false,
    mode: data.mode as GameMode | undefined,
  };
};
