type StitchCell = {
  color: string;
  isChecked: boolean;
};

const GAME_MODE = {
  NORMAL: "normal",
  CHALLENGE: "challenge",
} as const;

type GameMode = (typeof GAME_MODE)[keyof typeof GAME_MODE];

export { GAME_MODE };
export type { StitchCell, GameMode };
