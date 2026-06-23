"use client";

import { CROSSTITCH_DEFAULT_COLOR, CROSSTITCH_SPEC } from "../constant";
import { useAuthInfo } from "../providers/AuthProvider";
import { useStitch } from "../providers/StitchProvider";

export default function CrossTitch() {
  const { gridRef, gridState, selectColor, updateGridSate, checkedCount } =
    useStitch();
  const { effectiveCommitCount: commitLimit } = useAuthInfo();

  const rows = Array.from({ length: CROSSTITCH_SPEC });
  const cols = Array.from({ length: CROSSTITCH_SPEC });

  const handleGridState = (x: number, y: number) => {
    const cell = gridState[x][y];
    // 커밋 수 한도에 도달했을 때 새 셀 체크 차단
    if (!cell.isChecked && checkedCount >= commitLimit) return;

    updateGridSate(
      gridState.map((row, rowIndex) =>
        x === rowIndex
          ? row.map((col, colIndex) =>
              y === colIndex
                ? {
                    ...col,
                    isChecked: !col.isChecked,
                    color:
                      col.color === CROSSTITCH_DEFAULT_COLOR
                        ? selectColor
                        : CROSSTITCH_DEFAULT_COLOR,
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
      className="flex flex-col gap-[3px] p-4 bg-[#0d0d12] rounded-xl border border-[#1e1e2a]"
    >
      {rows.map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-[3px]">
          {cols.map((_, colIndex) => {
            const cell = gridState[rowIndex][colIndex];
            const isAtLimit = !cell.isChecked && checkedCount >= commitLimit;
            return (
              <div
                onClick={() => handleGridState(rowIndex, colIndex)}
                key={`cell-${rowIndex}-${colIndex}`}
                style={{ backgroundColor: cell.color }}
                className={`w-5 h-5 rounded-[3px] transition-all duration-100 ${
                  isAtLimit
                    ? "cursor-not-allowed opacity-50"
                    : "cursor-pointer hover:scale-110 hover:ring-2 hover:ring-white/60 hover:z-10"
                }`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
