import { CROSSTITCH_SPEC } from "@/app/src/constant";
import { GAME_MODE, GameMode } from "@/app/src/types/crossTitch";

const TOTAL_CELLS = CROSSTITCH_SPEC * CROSSTITCH_SPEC;

type ModeData = { commitCount: number; checkedCount: number };

export interface ModeCardConfig {
  headerTitle: string;
  heroLabel: string;
  heroBg: string;
  heroTextColor: string;
  heroSubColor: string;
  progressBg: string;
  heroValue: (d: ModeData) => number;
  progressTotal: (d: ModeData) => number;
  subText: (d: ModeData) => string;
}

export interface ModeConfig {
  id: GameMode;

  label: {
    icon: string;
    ko: string;
    en: string;
    color: string;
    badge?: string;
  };

  content: {
    title: string;
    desc: string;
    bullets: { ok: boolean; text: string }[];
    selectionDesc: string;
  };

  card: ModeCardConfig;

  flags: {
    hasCommitLimit: boolean;
    updateGridOnCron: boolean;
  };
}

export const MODE_LIST: ModeConfig[] = [
  {
    id: GAME_MODE.NORMAL,

    label: {
      icon: "🎨",
      ko: "일반 모드",
      en: "NORMAL MODE",
      color: "#3B9A3B",
    },

    content: {
      title: "자유롭게 창작하는 모드",
      desc: "커밋 수와 관계없이 원하는 만큼 칸을 채울 수 있어요. 칸이 줄어들거나 초기화되지 않아 편하게 작업할 수 있어요.",
      bullets: [
        { ok: true, text: "칸 수 제한 없음" },
        { ok: true, text: "커밋 감소해도 영향 없음" },
        { ok: true, text: "언제든 자유롭게" },
      ],
      selectionDesc: "커밋 수에 관계없이 자유롭게 채워요. 칸이 줄어들거나 초기화되지 않아요.",
    },

    card: {
      headerTitle: "MY CANVAS",
      heroLabel: "CANVAS",
      heroBg: "#FFFFFF",
      heroTextColor: "#1A1A1A",
      heroSubColor: "#7A7A7A",
      progressBg: "#E8E2DA",
      heroValue: ({ checkedCount }) => checkedCount,
      progressTotal: () => TOTAL_CELLS,
      subText: ({ checkedCount }) => `${checkedCount}칸 채움 / 전체 ${TOTAL_CELLS}`,
    },

    flags: {
      hasCommitLimit: false,
      updateGridOnCron: false,
    },
  },
  {
    id: GAME_MODE.CHALLENGE,

    label: {
      icon: "⚔️",
      ko: "도전 모드",
      en: "CHALLENGE MODE",
      color: "#C41E3A",
      badge: "GITHUB 연동",
    },

    content: {
      title: "GitHub 커밋과 연동되는 모드",
      desc: "이번 달 커밋 수만큼만 칸을 쓸 수 있어요. 커밋이 줄어들면 십자수도 함께 줄어들어요.",
      bullets: [
        { ok: true, text: "커밋 1개 = 픽셀 1칸" },
        { ok: false, text: "커밋 감소 시 칸 제거됨" },
        { ok: true, text: "GitHub 활동이 작품이 됨" },
      ],
      selectionDesc: "이번 달 커밋 수만큼 칸을 사용해요. 커밋이 줄면 십자수도 함께 줄어들어요.",
    },

    card: {
      headerTitle: "THIS MONTH",
      heroLabel: "THIS MONTH COMMITS",
      heroBg: "#1A1A1A",
      heroTextColor: "#FFFFFF",
      heroSubColor: "#888888",
      progressBg: "#333333",
      heroValue: ({ commitCount }) => commitCount,
      progressTotal: ({ commitCount }) => commitCount,
      subText: ({ checkedCount, commitCount }) =>
        `${checkedCount}칸 채움 / 한도 ${commitCount}`,
    },

    flags: {
      hasCommitLimit: true,
      updateGridOnCron: true,
    },
  },
];

export const MODE_MAP = Object.fromEntries(
  MODE_LIST.map((m) => [m.id, m]),
) as Record<GameMode, ModeConfig>;

export const DEFAULT_MODE_CONFIG = MODE_MAP[GAME_MODE.NORMAL];
