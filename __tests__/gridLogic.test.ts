import { describe, it, expect } from "vitest";
import {
  applyRandomRemovalCells,
  applyRandomRemovalGrid,
  shouldFullReset,
  isDroppedBelowThreshold,
} from "../app/src/utils/gridLogic";

const DEFAULT_COLOR = "oklch(44.6% 0.043 257.281)";

// ─── applyRandomRemovalCells ────────────────────────────────────────────────

describe("applyRandomRemovalCells", () => {
  const cells = [
    { r: 0, c: 0, color: "#ff0000" },
    { r: 0, c: 1, color: "#00ff00" },
    { r: 1, c: 0, color: "#0000ff" },
    { r: 1, c: 1, color: "#ffffff" },
  ];

  it("removeCount만큼 셀을 제거한다", () => {
    const result = applyRandomRemovalCells(cells, 2);
    expect(result).toHaveLength(2);
  });

  it("removeCount가 0이면 원본 그대로 반환한다", () => {
    const result = applyRandomRemovalCells(cells, 0);
    expect(result).toHaveLength(4);
  });

  it("빈 배열이면 그대로 반환한다", () => {
    const result = applyRandomRemovalCells([], 3);
    expect(result).toHaveLength(0);
  });

  it("removeCount가 전체 수보다 크면 모두 제거된다", () => {
    const result = applyRandomRemovalCells(cells, 10);
    expect(result).toHaveLength(0);
  });

  it("원본 배열을 변경하지 않는다", () => {
    const original = [...cells];
    applyRandomRemovalCells(cells, 2);
    expect(cells).toEqual(original);
  });

  it("removeCount가 음수면 원본 그대로 반환한다", () => {
    const result = applyRandomRemovalCells(cells, -1);
    expect(result).toHaveLength(4);
  });

  it("반환된 셀은 원본 셀의 서브셋이다", () => {
    const result = applyRandomRemovalCells(cells, 2);
    result.forEach((cell) => {
      expect(cells).toContainEqual(cell);
    });
  });
});

// ─── applyRandomRemovalGrid ─────────────────────────────────────────────────

describe("applyRandomRemovalGrid", () => {
  const makeGrid = (pattern: boolean[][]) =>
    pattern.map((row) =>
      row.map((checked) => ({
        color: checked ? "#ff0000" : "oklch(44.6% 0.043 257.281)",
        isChecked: checked,
      })),
    );

  it("removeCount만큼 체크된 칸을 제거한다", () => {
    const grid = makeGrid([
      [true, true, false],
      [false, true, true],
    ]);
    const result = applyRandomRemovalGrid(grid, 2);
    const checkedAfter = result.flat().filter((c) => c.isChecked).length;
    expect(checkedAfter).toBe(2);
  });

  it("removeCount가 0이면 그리드 그대로 반환한다", () => {
    const grid = makeGrid([
      [true, true],
      [false, false],
    ]);
    const result = applyRandomRemovalGrid(grid, 0);
    const checked = result.flat().filter((c) => c.isChecked).length;
    expect(checked).toBe(2);
  });

  it("원본 그리드를 변경하지 않는다 (불변성)", () => {
    const grid = makeGrid([
      [true, true],
      [true, false],
    ]);
    applyRandomRemovalGrid(grid, 2);
    const original = grid.flat().filter((c) => c.isChecked).length;
    expect(original).toBe(3);
  });

  it("removeCount가 체크된 칸 수보다 크면 모두 제거된다", () => {
    const grid = makeGrid([
      [true, false],
      [false, false],
    ]);
    const result = applyRandomRemovalGrid(grid, 5);
    const checked = result.flat().filter((c) => c.isChecked).length;
    expect(checked).toBe(0);
  });

  it("제거된 칸은 isChecked=false, color=DEFAULT_COLOR로 초기화된다", () => {
    const grid = makeGrid([
      [true, true],
      [false, false],
    ]);
    const result = applyRandomRemovalGrid(grid, 2);
    result.flat().forEach((cell) => {
      if (!cell.isChecked) expect(cell.color).toBe(DEFAULT_COLOR);
    });
  });

  it("체크 안 된 칸은 제거 후에도 영향받지 않는다", () => {
    const grid = makeGrid([
      [true, false],
      [false, true],
    ]);
    const result = applyRandomRemovalGrid(grid, 1);
    const unchecked = result.flat().filter((c) => !c.isChecked);
    unchecked.forEach((cell) => expect(cell.color).toBe(DEFAULT_COLOR));
  });
});

// ─── shouldFullReset ────────────────────────────────────────────────────────

describe("shouldFullReset", () => {
  it("savedCount >= 10이고 currentCount가 30% 이하면 true", () => {
    expect(shouldFullReset(10, 3)).toBe(true); // 30% 경계
    expect(shouldFullReset(10, 2)).toBe(true); // 20%
    expect(shouldFullReset(20, 5)).toBe(true); // 25%
  });

  it("currentCount가 30% 초과면 false", () => {
    expect(shouldFullReset(10, 4)).toBe(false); // 40%
    expect(shouldFullReset(10, 10)).toBe(false);
  });

  it("savedCount가 10 미만이면 false (보호 조건)", () => {
    expect(shouldFullReset(9, 0)).toBe(false);
    expect(shouldFullReset(5, 1)).toBe(false);
  });

  it("savedCount가 0이면 false", () => {
    expect(shouldFullReset(0, 0)).toBe(false);
  });
});

// ─── isDroppedBelowThreshold ────────────────────────────────────────────────

describe("isDroppedBelowThreshold", () => {
  it("30% 이하로 떨어지면 true (savedCount 무관)", () => {
    expect(isDroppedBelowThreshold(5, 1)).toBe(true); // 20%
    expect(isDroppedBelowThreshold(5, 0)).toBe(true); // 0%
  });

  it("30% 초과면 false", () => {
    expect(isDroppedBelowThreshold(5, 2)).toBe(false); // 40%
    expect(isDroppedBelowThreshold(10, 5)).toBe(false);
  });

  it("savedCount가 0이면 항상 false", () => {
    expect(isDroppedBelowThreshold(0, 0)).toBe(false);
  });
});
