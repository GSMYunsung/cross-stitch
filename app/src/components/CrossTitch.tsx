"use client";

import { CROSSTITCH_SPEC } from "../constant";
import { GAME_MODE } from "../types/crossTitch";
import { useAuthInfo } from "../providers/AuthProvider";
import { useStitch } from "../providers/StitchProvider";

const CELL_EMPTY = "#FDFCFA";
const CELL_DEFAULT_COLOR = "oklch(44.6% 0.043 257.281)";

export default function CrossTitch() {
  const { gridRef, gridState, selectColor, updateGridSate, checkedCount, mode } = useStitch();
  const { effectiveCommitCount: commitLimit } = useAuthInfo();

  const rows = Array.from({ length: CROSSTITCH_SPEC });
  const cols = Array.from({ length: CROSSTITCH_SPEC });

  const handleGridState = (x: number, y: number) => {
    const cell = gridState[x][y];
    if (!cell.isChecked && mode === GAME_MODE.CHALLENGE && checkedCount >= commitLimit) return;

    updateGridSate(
      gridState.map((row, rowIndex) =>
        x === rowIndex
          ? row.map((col, colIndex) =>
              y === colIndex
                ? {
                    ...col,
                    isChecked: !col.isChecked,
                    color: col.color === CELL_DEFAULT_COLOR ? selectColor : CELL_DEFAULT_COLOR,
                  }
                : col,
            )
          : row,
      ),
    );
  };

  return (
    <div
      ref={gridRef}
      className="flex flex-col"
      style={{
        gap: "2px",
        padding: "2px",
        background: "#D5CFC7",
        border: "2.5px solid #1A1A1A",
        boxShadow: "4px 4px 0px #1A1A1A",
      }}
    >
      {rows.map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex" style={{ gap: "2px" }}>
          {cols.map((_, colIndex) => {
            const cell = gridState[rowIndex][colIndex];
            const isAtLimit =
              mode === GAME_MODE.CHALLENGE && !cell.isChecked && checkedCount >= commitLimit;

            return (
              <div
                onClick={() => handleGridState(rowIndex, colIndex)}
                key={`cell-${rowIndex}-${colIndex}`}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: cell.isChecked ? cell.color : CELL_EMPTY,
                  cursor: isAtLimit ? "not-allowed" : "pointer",
                  opacity: isAtLimit ? 0.35 : 1,
                  transition: "transform 0.05s",
                }}
                onMouseEnter={(e) => {
                  if (!isAtLimit) (e.currentTarget as HTMLDivElement).style.transform = "scale(1.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
