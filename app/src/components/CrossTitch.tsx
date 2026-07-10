"use client";

import { useEffect, useRef } from "react";
import { CROSSTITCH_SPEC } from "../constant";
import { GAME_MODE } from "../types/crossTitch";
import { useAuthInfo } from "../providers/AuthProvider";
import { useStitch } from "../providers/StitchProvider";

const CELL_EMPTY = "#FDFCFA";
const CELL_DEFAULT_COLOR = "oklch(44.6% 0.043 257.281)";

export default function CrossTitch() {
  const { gridRef, gridState, selectColor, updateGridSate, checkedCount, mode } = useStitch();
  const { effectiveCommitCount: commitLimit } = useAuthInfo();

  const isDragging = useRef(false);
  const dragAction = useRef<"fill" | "erase">("fill");
  const paintedCells = useRef<Set<string>>(new Set());

  useEffect(() => {
    const stop = () => {
      isDragging.current = false;
      paintedCells.current.clear();
    };
    window.addEventListener("mouseup", stop);
    return () => window.removeEventListener("mouseup", stop);
  }, []);

  const paintCell = (x: number, y: number) => {
    const key = `${x}-${y}`;
    if (paintedCells.current.has(key)) return;

    const cell = gridState[x][y];
    const filling = dragAction.current === "fill";

    if (filling === cell.isChecked) return;
    if (filling && mode === GAME_MODE.CHALLENGE && checkedCount >= commitLimit) return;

    paintedCells.current.add(key);
    updateGridSate(
      gridState.map((row, ri) =>
        ri === x
          ? row.map((col, ci) =>
              ci === y
                ? { ...col, isChecked: filling, color: filling ? selectColor : CELL_DEFAULT_COLOR }
                : col,
            )
          : row,
      ),
    );
  };

  const rows = Array.from({ length: CROSSTITCH_SPEC });
  const cols = Array.from({ length: CROSSTITCH_SPEC });

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
        userSelect: "none",
      }}
      onDragStart={(e) => e.preventDefault()}
    >
      {rows.map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex" style={{ gap: "2px" }}>
          {cols.map((_, colIndex) => {
            const cell = gridState[rowIndex][colIndex];
            const isAtLimit =
              mode === GAME_MODE.CHALLENGE && !cell.isChecked && checkedCount >= commitLimit;

            return (
              <div
                key={`cell-${rowIndex}-${colIndex}`}
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor: cell.isChecked ? cell.color : CELL_EMPTY,
                  cursor: isAtLimit ? "not-allowed" : "crosshair",
                  opacity: isAtLimit ? 0.35 : 1,
                  position: "relative",
                  zIndex: 1,
                  transition: "transform 0.12s ease, box-shadow 0.12s ease",
                  willChange: "transform",
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (isAtLimit) return;
                  isDragging.current = true;
                  paintedCells.current.clear();
                  dragAction.current = cell.isChecked ? "erase" : "fill";
                  paintCell(rowIndex, colIndex);
                }}
                onMouseEnter={(e) => {
                  if (!isAtLimit) {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.transform = "scale(1.6)";
                    el.style.zIndex = "20";
                    el.style.boxShadow = "0 0 0 1.5px #1A1A1A, 0 4px 12px rgba(0,0,0,0.3)";
                  }
                  if (!isDragging.current || isAtLimit) return;
                  paintCell(rowIndex, colIndex);
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "scale(1)";
                  el.style.zIndex = "1";
                  el.style.boxShadow = "none";
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
