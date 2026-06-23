import { db } from "@/app/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  CROSSTITCH_DEFAULT_COLOR,
  CROSSTITCH_SPEC,
} from "@/app/src/constant";
import { StitchCell } from "../types/crossTitch";

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
): Promise<void> => {
  const checkedCells: CheckedCell[] = [];
  gridState.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell.isChecked) checkedCells.push({ r, c, color: cell.color });
    }),
  );

  const docRef = doc(db, "grids", userId);
  // merge: true 로 firstLoginAt 필드 보존
  await setDoc(
    docRef,
    {
      checkedCells,
      commitCount,
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
};

export const clearResetFlag = async (userId: string): Promise<void> => {
  const docRef = doc(db, "grids", userId);
  await setDoc(docRef, { wasReset: false }, { merge: true });
};

export const loadGrid = async (
  userId: string,
): Promise<SavedGridData | null> => {
  try {
    const docRef = doc(db, "grids", userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    const grid = makeBlankGrid();

    for (const { r, c, color } of data.checkedCells as CheckedCell[]) {
      grid[r][c] = { color, isChecked: true };
    }

    return {
      gridState: grid,
      commitCount: data.commitCount ?? 0,
      updatedAt: data.updatedAt ?? "",
      firstLoginAt: data.firstLoginAt ?? data.updatedAt ?? "",
      githubUsername: data.githubUsername ?? undefined,
      wasReset: data.wasReset ?? false,
    };
  } catch {
    return null;
  }
};
