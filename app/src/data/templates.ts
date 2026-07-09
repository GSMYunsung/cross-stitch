import { CROSSTITCH_DEFAULT_COLOR, CROSSTITCH_SPEC } from "../constant";
import { StitchCell } from "../types/crossTitch";

export interface Template {
  id: string;
  name: string;
  emoji: string;
  cells: { r: number; c: number; color: string }[];
}

function parse(
  rows: string[],
  colors: Record<string, string>,
): { r: number; c: number; color: string }[] {
  const cells: { r: number; c: number; color: string }[] = [];
  rows.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch !== "." && colors[ch]) {
        cells.push({ r, c, color: colors[ch] });
      }
    });
  });
  return cells;
}

export function templateToGrid(
  cells: { r: number; c: number; color: string }[],
): StitchCell[][] {
  const grid: StitchCell[][] = Array.from({ length: CROSSTITCH_SPEC }, () =>
    Array.from({ length: CROSSTITCH_SPEC }, () => ({
      color: CROSSTITCH_DEFAULT_COLOR,
      isChecked: false,
    })),
  );
  for (const { r, c, color } of cells) {
    if (r >= 0 && r < CROSSTITCH_SPEC && c >= 0 && c < CROSSTITCH_SPEC) {
      grid[r][c] = { color, isChecked: true };
    }
  }
  return grid;
}

export const TEMPLATES: Template[] = [
  {
    id: "heart",
    name: "하트",
    emoji: "❤️",
    cells: parse(
      [
        "....................",
        "....................",
        "...RRRR......RRRR...",
        "..RRRRRR....RRRRRR..",
        ".RRRRRRRR..RRRRRRRR.",
        ".RRPPRRRRRRRRRRRRRR.",
        ".RRPPRRRRRRRRRRRRRR.",
        ".RRRRRRRRRRRRRRRRRR.",
        ".RRRRRRRRRRRRRRRRRR.",
        "..RRRRRRRRRRRRRRRR..",
        "...RRRRRRRRRRRRRR...",
        "....RRRRRRRRRRRR....",
        ".....RRRRRRRRRR.....",
        "......RRRRRRRR......",
        ".......RRRRRR.......",
        "........RRRR........",
        ".........RR.........",
        "....................",
        "....................",
        "....................",
      ],
      { R: "#E24B4A", P: "#F7C1C1" },
    ),
  },
  {
    id: "strawberry",
    name: "딸기",
    emoji: "🍓",
    cells: parse(
      [
        "....................",
        ".........GG.........",
        "........GGGG........",
        "...GGG..GGGG..GGG...",
        "....GGGGGGGGGGGG....",
        "...RRGGGGGGGGGGRR...",
        "..RRRRRGGGGGGRRRRR..",
        "..RRRRRRRRRRRRRRRR..",
        ".RRRWRRRRRRRRRWRRRR.",
        ".RRRRRRRWRRRRRRRRRR.",
        ".RRWRRRRRRRRRRWRRRR.",
        ".RRRRRRRRRWRRRRRRRR.",
        "..RRRRWRRRRRRRWRRR..",
        "..RRRRRRRRRWRRRRRR..",
        "...RRRWRRRRRRRRRR...",
        "....RRRRRWRRRRRR....",
        ".....RRRRRRRRRR.....",
        ".......RRRRRR.......",
        "........RRRR........",
        "....................",
      ],
      { R: "#E24B4A", G: "#639922", W: "#FAEEDA" },
    ),
  },
  {
    id: "chick",
    name: "병아리",
    emoji: "🐣",
    cells: parse(
      [
        "....................",
        "....................",
        "......YYYYYYYY......",
        ".....YYYYYYYYYY.....",
        "....YYYYYYYYYYYY....",
        "...YYYYYYYYYYYYYY...",
        "...YYKKYYYYYYKKYY...",
        "...YYKKYYYYYYKKYY...",
        "...YYYYYYOOYYYYYY...",
        "..YYYYYYOOOOYYYYYY..",
        "..YYPPYYYOOYYYPPYY..",
        "..YYYYYYYYYYYYYYYY..",
        "..YYYYYYYYYYYYYYYY..",
        "...YYYYYYYYYYYYYY...",
        "....YYYYYYYYYYYY....",
        ".....YYYYYYYYYY.....",
        "......YYYYYYYY......",
        ".......OO..OO.......",
        "....................",
        "....................",
      ],
      { Y: "#F9CB42", O: "#EF9F27", K: "#2C2C2A", P: "#F4C0D1" },
    ),
  },
  {
    id: "mushroom",
    name: "버섯",
    emoji: "🍄",
    cells: parse(
      [
        "....................",
        "....................",
        ".......RRRRRR.......",
        ".....RRRRRRRRRR.....",
        "....RRWWRRRRRRRR....",
        "...RRRWWRRRRWWRRR...",
        "..RRRRRRRRRRWWRRRR..",
        "..RRWWRRRRRRRRRRRR..",
        "..RRRRRRRWWRRRRRRR..",
        "..RRRRRRRRRRRRRRRR..",
        "......CCCCCCCC......",
        "......CCCCCCCC......",
        "......CCCCCCCC......",
        "......CCCCCCCC......",
        ".....CCCCCCCCCC.....",
        ".....CCCCCCCCCC.....",
        "....................",
        "....................",
        "....................",
        "....................",
      ],
      { R: "#E24B4A", W: "#FFFFFF", C: "#FAEEDA" },
    ),
  },
];
