//TODO: 색 관련으로 여러 색 사용 가능하게 구현할건지?
"use client";

import { CROSSTITCH_DEFAULT_COLOR, CROSSTITCH_SPEC } from "../constant";
import { useStitch } from "../providers/StitchProvider";

export default function CrossTitch() {
  const { gridRef, gridState, updateGridSate } = useStitch();

  const rows = Array.from({ length: CROSSTITCH_SPEC });
  const cols = Array.from({ length: CROSSTITCH_SPEC });

  const handleGridState = (x: number, y: number) => {
    updateGridSate(
      gridState.map((row, rowIndex) => {
        return x === rowIndex
          ? row.map((col, colIndex) => {
              return y === colIndex
                ? {
                    ...col,
                    isChecked: !col.isChecked,
                    color:
                      col.color == CROSSTITCH_DEFAULT_COLOR
                        ? "pink"
                        : CROSSTITCH_DEFAULT_COLOR,
                  }
                : col;
            })
          : row;
      }),
    );
  };

  return (
    <div
      ref={gridRef}
      className="flex flex-col gap-1 p-4 bg-gray-900 overflow-auto rounded-xl"
    >
      {rows.map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-1">
          {cols.map((_, colIndex) => (
            <div
              onClick={() => {
                console.log(rowIndex, colIndex);
                handleGridState(rowIndex, colIndex);
              }}
              key={`cell-${rowIndex}-${colIndex}`}
              style={{ backgroundColor: gridState[rowIndex][colIndex].color }}
              className="w-4 h-4 rounded-sm transition-all cursor-pointer hover:scale-110 hover:ring-2 hover:ring-white z-10"
              title={`${rowIndex}, ${colIndex}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
