"use client";
import { createContext, useContext, useMemo, useRef, useState } from "react";
import { GAME_MODE, GameMode, StitchCell } from "../types/crossTitch";
import {
  CROSSTITCH_DEFAULT_COLOR,
  CROSSTITCH_DEFAULT_SELECT_COLOR,
  CROSSTITCH_SPEC,
} from "../constant";

const StitchContext = createContext<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  hasCheckedItem: () => boolean;
  checkedCount: number;
  gridState: StitchCell[][];
  updateGridSate: (newData: StitchCell[][]) => void;
  resetGridState: () => void;
  selectColor: string;
  updateSelectColor: (selectColor: string) => void;
  paletteHistory: string[];
  mode: GameMode;
} | null>(null);

const makeBlankGrid = (): StitchCell[][] =>
  Array.from({ length: CROSSTITCH_SPEC }, () =>
    Array.from({ length: CROSSTITCH_SPEC }, () => ({
      color: CROSSTITCH_DEFAULT_COLOR,
      isChecked: false,
    })),
  );

interface StitchProviderProps {
  children: React.ReactNode;
  initialGrid?: StitchCell[][];
  mode?: GameMode;
}

export function StitchProvider({ children, initialGrid, mode = GAME_MODE.CHALLENGE }: StitchProviderProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectColor, setSelectColor] = useState(CROSSTITCH_DEFAULT_SELECT_COLOR);
  const [paletteHistory, setPaletteHistory] = useState<string[]>([]);
  const [gridState, setGridState] = useState<StitchCell[][]>(
    () => initialGrid ?? makeBlankGrid(),
  );

  const checkedCount = useMemo(
    () => gridState.flat().filter((cell) => cell.isChecked).length,
    [gridState],
  );

  const hasCheckedItem = (): boolean => checkedCount > 0;

  const updateGridSate = (newData: StitchCell[][]) => setGridState(newData);

  const resetGridState = () => setGridState(makeBlankGrid());

  const updateSelectColor = (color: string) => {
    setSelectColor(color);
    setPaletteHistory((prev) => {
      const filtered = prev.filter((c) => c !== color);
      return [color, ...filtered].slice(0, 8);
    });
  };

  return (
    <StitchContext.Provider
      value={{
        selectColor,
        updateSelectColor,
        paletteHistory,
        gridRef,
        hasCheckedItem,
        checkedCount,
        gridState,
        updateGridSate,
        resetGridState,
        mode,
      }}
    >
      {children}
    </StitchContext.Provider>
  );
}

export const useStitch = () => useContext(StitchContext)!;
