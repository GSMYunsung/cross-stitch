"use client";
import { createContext, useContext, useRef, useState } from "react";
import { StitchCell } from "../types/crossTitch";
import {
  CROSSTITCH_DEFAULT_COLOR,
  CROSSTITCH_DEFAULT_SELECT_COLOR,
  CROSSTITCH_SPEC,
} from "../constant";

const StitchContext = createContext<{
  gridRef: React.RefObject<HTMLDivElement | null>;
  hasCheckedItem: () => boolean;
  gridState: StitchCell[][];
  updateGridSate: (newData: StitchCell[][]) => void;
  resetGridState: () => void;
  selectColor: string;
  updateSelectColor: (selectColor: string) => void;
} | null>(null);

export function StitchProvider({ children }: { children: React.ReactNode }) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [selectColor, setSelectColor] = useState(
    CROSSTITCH_DEFAULT_SELECT_COLOR,
  );

  const initialGridState: StitchCell[][] = Array.from(
    { length: CROSSTITCH_SPEC },
    () =>
      Array.from({ length: CROSSTITCH_SPEC }, () => ({
        color: CROSSTITCH_DEFAULT_COLOR,
        isChecked: false,
      })),
  );

  const [gridState, setGridState] = useState(initialGridState);

  const hasCheckedItem = (): boolean => {
    return gridState.some((row) => row.some((cell) => cell.isChecked));
  };

  const updateGridSate = (newData: StitchCell[][]) => {
    setGridState(newData);
  };

  const resetGridState = () => {
    setGridState(initialGridState);
  };

  const updateSelectColor = (selectColor: string) => {
    setSelectColor(selectColor);
  };

  return (
    <StitchContext.Provider
      value={{
        selectColor,
        updateSelectColor,
        gridRef,
        hasCheckedItem,
        gridState,
        updateGridSate,
        resetGridState,
      }}
    >
      {children}
    </StitchContext.Provider>
  );
}

export const useStitch = () => useContext(StitchContext)!;
