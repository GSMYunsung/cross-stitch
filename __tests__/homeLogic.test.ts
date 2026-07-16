/**
 * HomeContent 의 화면 전환 조건 및 Header 숨김 조건 테스트
 *
 * React 없이 순수 로직만 검증한다.
 * HomeContent 의 state derivation 은 컴포넌트 내부 인라인 계산이라
 * 동일 로직을 여기서 순수 함수로 재현해 테스트한다.
 */
import { describe, it, expect } from "vitest";
import { GAME_MODE, GameMode } from "../app/src/types/crossTitch";
import { isDroppedBelowThreshold } from "../app/src/utils/gridLogic";

// ─── 테스트용 타입 (Firebase import 없이) ──────────────────────────────────────

interface GridCell {
  isChecked: boolean;
  color: string;
}

interface TestSavedGridData {
  gridState: GridCell[][];
  commitCount: number;
  updatedAt: string;
  firstLoginAt: string;
  mode?: GameMode;
  wasReset?: boolean;
}

// ─── 픽스처 헬퍼 ──────────────────────────────────────────────────────────────

const EMPTY_COLOR = "oklch(44.6% 0.043 257.281)";

const emptyCell = (): GridCell => ({ isChecked: false, color: EMPTY_COLOR });
const filledCell = (): GridCell => ({ isChecked: true, color: "#ff0000" });

/** N개의 칸이 채워진 20×20 그리드 */
const makeGrid = (filledCount: number): GridCell[][] => {
  const grid = Array.from({ length: 20 }, () =>
    Array.from({ length: 20 }, () => emptyCell()),
  );
  let placed = 0;
  for (let r = 0; r < 20 && placed < filledCount; r++) {
    for (let c = 0; c < 20 && placed < filledCount; c++) {
      grid[r][c] = filledCell();
      placed++;
    }
  }
  return grid;
};

/** 기본 저장 데이터 — 각 테스트에서 필요한 필드만 오버라이드 */
const savedGrid = (overrides: Partial<TestSavedGridData> = {}): TestSavedGridData => ({
  gridState: makeGrid(5),
  commitCount: 10,
  updatedAt: new Date().toISOString(),
  firstLoginAt: new Date().toISOString(),
  mode: GAME_MODE.CHALLENGE,
  wasReset: false,
  ...overrides,
});

// ─── HomeContent 화면 전환 로직 (컴포넌트와 동일하게 재현) ───────────────────

interface HomeState {
  hasSavedGrid: boolean;
  /** "SAVED WORK FOUND" 복원 선택 팝업 표시 여부 */
  waitingForChoice: boolean;
  /** 현재 유효한 게임 모드 (null = 아직 선택 전) */
  effectiveMode: GameMode | null;
  /** 모드 선택 모달/환영 모달 표시 트리거 */
  waitingForMode: boolean;
  /** 크론 리셋 알림 모달 표시 여부 */
  showResetModal: boolean;
  /** CHALLENGE 모드 커밋 0개 안내 화면 표시 여부 */
  showNoCommits: boolean;
  /** 커밋 급감으로 칸 자동 조정 필요 여부 */
  isResetThreshold: boolean;
}

function deriveHomeState({
  isGridLoaded,
  savedGridData,
  restoreChoice,
  modeChoice,
  commitCount,
  resetDismissed,
}: {
  isGridLoaded: boolean;
  savedGridData: TestSavedGridData | null;
  restoreChoice: "restore" | "fresh" | null;
  modeChoice: GameMode | null;
  commitCount: number;
  resetDismissed: boolean;
}): HomeState {
  const hasActualStitches =
    savedGridData?.gridState.flat().some((c) => c.isChecked) ?? false;
  const hasSavedGrid = isGridLoaded && savedGridData !== null && hasActualStitches;

  const savedCount = savedGridData?.commitCount ?? 0;
  const isResetThreshold =
    savedGridData?.mode !== GAME_MODE.NORMAL &&
    isDroppedBelowThreshold(savedCount, commitCount);

  const waitingForChoice =
    hasSavedGrid && restoreChoice === null && !savedGridData?.wasReset;

  const effectiveMode: GameMode | null = (() => {
    if (restoreChoice === "restore") return savedGridData?.mode ?? GAME_MODE.CHALLENGE;
    if (savedGridData?.wasReset) return savedGridData?.mode ?? GAME_MODE.CHALLENGE;
    if (isResetThreshold && hasSavedGrid) return savedGridData!.mode ?? GAME_MODE.CHALLENGE;
    if (restoreChoice === "fresh") return modeChoice;
    if (savedGridData?.mode !== undefined) return savedGridData.mode;
    return modeChoice;
  })();

  const shouldRestore = restoreChoice === "restore" || (isResetThreshold && hasSavedGrid);
  const waitingForMode =
    effectiveMode === null && !waitingForChoice && !savedGridData?.wasReset;
  const showResetModal = !!(savedGridData?.wasReset && !resetDismissed);
  const showNoCommits =
    effectiveMode === GAME_MODE.CHALLENGE && commitCount === 0 && !shouldRestore;

  return {
    hasSavedGrid,
    waitingForChoice,
    effectiveMode,
    waitingForMode,
    showResetModal,
    showNoCommits,
    isResetThreshold,
  };
}

// ─── 헤더 숨김 조건 (Header.tsx와 동일) ──────────────────────────────────────

function shouldHideHeader(user: object | null, pathname: string): boolean {
  return !user || pathname === "/login";
}

// ─────────────────────────────────────────────────────────────────────────────

describe("저장된 작업 복원 팝업 (SAVED WORK FOUND)", () => {
  const base = {
    isGridLoaded: true,
    restoreChoice: null as null,
    modeChoice: null as null,
    commitCount: 10,
    resetDismissed: false,
  };

  it("저장된 십자수가 있으면 복원 팝업이 표시된다", () => {
    const { waitingForChoice } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ mode: GAME_MODE.CHALLENGE }),
    });
    expect(waitingForChoice).toBe(true);
  });

  it("저장된 셀이 하나도 없으면 팝업이 뜨지 않는다 (신규 유저)", () => {
    const { waitingForChoice } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ gridState: makeGrid(0) }),
    });
    expect(waitingForChoice).toBe(false);
  });

  it("그리드가 아직 로딩 중이면 팝업이 뜨지 않는다", () => {
    const { waitingForChoice } = deriveHomeState({
      ...base,
      isGridLoaded: false,
      savedGridData: savedGrid(),
    });
    expect(waitingForChoice).toBe(false);
  });

  it("이미 restore를 선택한 경우 팝업이 뜨지 않는다", () => {
    const { waitingForChoice } = deriveHomeState({
      ...base,
      savedGridData: savedGrid(),
      restoreChoice: "restore",
    });
    expect(waitingForChoice).toBe(false);
  });

  it("이미 fresh를 선택한 경우 팝업이 뜨지 않는다", () => {
    const { waitingForChoice } = deriveHomeState({
      ...base,
      savedGridData: savedGrid(),
      restoreChoice: "fresh",
    });
    expect(waitingForChoice).toBe(false);
  });

  it("wasReset=true이면 복원 팝업 대신 리셋 알림 모달을 사용한다", () => {
    const { waitingForChoice, showResetModal } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ wasReset: true }),
    });
    expect(waitingForChoice).toBe(false);
    expect(showResetModal).toBe(true);
  });

  it("저장 데이터 자체가 null이면 팝업이 뜨지 않는다 (최초 로그인)", () => {
    const { waitingForChoice } = deriveHomeState({
      ...base,
      savedGridData: null,
    });
    expect(waitingForChoice).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("유효 모드 계산 (effectiveMode)", () => {
  const base = {
    isGridLoaded: true,
    commitCount: 10,
    resetDismissed: false,
  };

  it("restore 선택 시 저장된 모드를 사용한다", () => {
    const { effectiveMode } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ mode: GAME_MODE.NORMAL }),
      restoreChoice: "restore",
      modeChoice: null,
    });
    expect(effectiveMode).toBe(GAME_MODE.NORMAL);
  });

  it("fresh 선택 시 새로 고른 modeChoice를 사용한다", () => {
    const { effectiveMode } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ mode: GAME_MODE.CHALLENGE }),
      restoreChoice: "fresh",
      modeChoice: GAME_MODE.NORMAL,
    });
    expect(effectiveMode).toBe(GAME_MODE.NORMAL);
  });

  it("wasReset이면 선택 없이도 저장된 모드가 바로 사용된다", () => {
    const { effectiveMode } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ wasReset: true, mode: GAME_MODE.CHALLENGE }),
      restoreChoice: null,
      modeChoice: null,
    });
    expect(effectiveMode).toBe(GAME_MODE.CHALLENGE);
  });

  it("저장된 mode가 있으면 선택 없이도 그 모드가 사용된다", () => {
    const { effectiveMode } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ gridState: makeGrid(0), mode: GAME_MODE.NORMAL }),
      restoreChoice: null,
      modeChoice: null,
    });
    expect(effectiveMode).toBe(GAME_MODE.NORMAL);
  });

  it("저장된 mode가 없고 modeChoice도 없으면 null (모드 선택 대기)", () => {
    const { effectiveMode } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ gridState: makeGrid(0), mode: undefined }),
      restoreChoice: null,
      modeChoice: null,
    });
    expect(effectiveMode).toBe(null);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("모드 선택 / 환영 모달 (waitingForMode)", () => {
  const base = {
    isGridLoaded: true,
    commitCount: 5,
    resetDismissed: false,
  };

  it("신규 유저(저장 없음)이고 모드를 고르지 않았으면 모드 선택 대기 상태", () => {
    const { waitingForMode } = deriveHomeState({
      ...base,
      savedGridData: null,
      restoreChoice: null,
      modeChoice: null,
    });
    expect(waitingForMode).toBe(true);
  });

  it("모드를 고른 이후에는 모드 선택 대기 상태가 아니다", () => {
    const { waitingForMode } = deriveHomeState({
      ...base,
      savedGridData: null,
      restoreChoice: null,
      modeChoice: GAME_MODE.NORMAL,
    });
    expect(waitingForMode).toBe(false);
  });

  it("복원 팝업을 기다리는 동안에는 모드 선택 모달이 뜨지 않는다", () => {
    const { waitingForMode, waitingForChoice } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ mode: undefined }),
      restoreChoice: null,
      modeChoice: null,
    });
    expect(waitingForChoice).toBe(true);
    expect(waitingForMode).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("크론 리셋 알림 모달 (showResetModal)", () => {
  const base = {
    isGridLoaded: true,
    restoreChoice: null as null,
    modeChoice: null as null,
    commitCount: 5,
  };

  it("wasReset=true이고 닫지 않은 경우 리셋 알림이 표시된다", () => {
    const { showResetModal } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ wasReset: true }),
      resetDismissed: false,
    });
    expect(showResetModal).toBe(true);
  });

  it("유저가 알림을 닫으면(resetDismissed=true) 표시되지 않는다", () => {
    const { showResetModal } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ wasReset: true }),
      resetDismissed: true,
    });
    expect(showResetModal).toBe(false);
  });

  it("wasReset=false이면 알림이 표시되지 않는다", () => {
    const { showResetModal } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ wasReset: false }),
      resetDismissed: false,
    });
    expect(showResetModal).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("CHALLENGE 0커밋 안내 화면 (showNoCommits)", () => {
  const base = {
    isGridLoaded: true,
    resetDismissed: false,
  };

  it("CHALLENGE 모드이고 커밋이 0개면 안내 화면이 표시된다", () => {
    const { showNoCommits } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ gridState: makeGrid(0), mode: GAME_MODE.CHALLENGE }),
      restoreChoice: null,
      modeChoice: GAME_MODE.CHALLENGE,
      commitCount: 0,
    });
    expect(showNoCommits).toBe(true);
  });

  it("NORMAL 모드이면 커밋이 0개여도 안내 화면이 표시되지 않는다", () => {
    const { showNoCommits } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ gridState: makeGrid(0), mode: GAME_MODE.NORMAL }),
      restoreChoice: null,
      modeChoice: GAME_MODE.NORMAL,
      commitCount: 0,
    });
    expect(showNoCommits).toBe(false);
  });

  it("restore를 선택했다면 커밋이 0개여도 안내 화면이 표시되지 않는다", () => {
    const { showNoCommits } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ mode: GAME_MODE.CHALLENGE }),
      restoreChoice: "restore",
      modeChoice: null,
      commitCount: 0,
    });
    expect(showNoCommits).toBe(false);
  });

  it("커밋이 1개 이상이면 안내 화면이 표시되지 않는다", () => {
    const { showNoCommits } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ gridState: makeGrid(0), mode: GAME_MODE.CHALLENGE }),
      restoreChoice: null,
      modeChoice: GAME_MODE.CHALLENGE,
      commitCount: 1,
    });
    expect(showNoCommits).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("CHALLENGE 커밋 급감 시 자동 칸 조정 (isResetThreshold)", () => {
  it("커밋이 30% 이하로 감소하면 자동 조정 대상이 된다", () => {
    const { isResetThreshold } = deriveHomeState({
      isGridLoaded: true,
      savedGridData: savedGrid({ commitCount: 10, mode: GAME_MODE.CHALLENGE }),
      restoreChoice: null,
      modeChoice: null,
      commitCount: 3, // 30%
      resetDismissed: false,
    });
    expect(isResetThreshold).toBe(true);
  });

  it("NORMAL 모드이면 커밋이 감소해도 자동 조정되지 않는다", () => {
    const { isResetThreshold } = deriveHomeState({
      isGridLoaded: true,
      savedGridData: savedGrid({ commitCount: 10, mode: GAME_MODE.NORMAL }),
      restoreChoice: null,
      modeChoice: null,
      commitCount: 1,
      resetDismissed: false,
    });
    expect(isResetThreshold).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("헤더 숨김 조건 (Header.tsx)", () => {
  it("유저가 없으면 헤더를 숨긴다 (비로그인 상태)", () => {
    expect(shouldHideHeader(null, "/home")).toBe(true);
  });

  it("/login 경로이면 로그인 상태여도 헤더를 숨긴다", () => {
    const fakeUser = { uid: "abc123" };
    expect(shouldHideHeader(fakeUser, "/login")).toBe(true);
  });

  it("로그인 상태이고 /login이 아닌 경로면 헤더가 표시된다", () => {
    const fakeUser = { uid: "abc123" };
    expect(shouldHideHeader(fakeUser, "/home")).toBe(false);
  });

  it("/login을 포함하는 서브패스에서는 헤더가 표시된다", () => {
    // '/login/callback' 같은 경로는 정확히 '/login'이 아님
    const fakeUser = { uid: "abc123" };
    expect(shouldHideHeader(fakeUser, "/login/callback")).toBe(false);
  });
});
