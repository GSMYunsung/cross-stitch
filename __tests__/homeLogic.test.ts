/**
 * HomeContent 화면 전환 조건 및 Header 숨김 조건 테스트
 *
 * 프로덕션 코드와 동일한 함수를 임포트해 검증한다.
 * deriveHomeState — HomeContent.tsx와 공유
 * isHeaderVisible  — Header.tsx와 공유
 */
import { describe, it, expect } from "vitest";
import type { SavedGridData } from "../app/src/hooks/useGridPersistence";
import { GAME_MODE } from "../app/src/types/crossTitch";
import { deriveHomeState, isHeaderVisible } from "../app/src/utils/homeState";

// ─── 픽스처 헬퍼 ──────────────────────────────────────────────────────────────

const EMPTY_COLOR = "oklch(44.6% 0.043 257.281)";

const emptyCell = () => ({ isChecked: false, color: EMPTY_COLOR });
const filledCell = () => ({ isChecked: true, color: "#ff0000" });

/** N개의 칸이 채워진 20×20 그리드 */
const makeGrid = (filledCount: number): SavedGridData["gridState"] => {
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
const savedGrid = (overrides: Partial<SavedGridData> = {}): SavedGridData => ({
  gridState: makeGrid(5),
  commitCount: 10,
  updatedAt: new Date().toISOString(),
  firstLoginAt: new Date().toISOString(),
  mode: GAME_MODE.CHALLENGE,
  wasReset: false,
  ...overrides,
});

/** deriveHomeState 호출에 필요한 기본값 */
const base = {
  isGridLoaded: true,
  restoreChoice: null as null,
  modeChoice: null as null,
  currentCommitCount: 10,
  effectiveCommitCount: 10,
  resetDismissed: false,
};

// ─────────────────────────────────────────────────────────────────────────────

describe("저장된 작업 복원 팝업 (SAVED WORK FOUND)", () => {
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
  it("CHALLENGE 모드이고 effectiveCommitCount가 0이면 안내 화면이 표시된다", () => {
    const { showNoCommits } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ gridState: makeGrid(0), mode: GAME_MODE.CHALLENGE }),
      restoreChoice: null,
      modeChoice: GAME_MODE.CHALLENGE,
      currentCommitCount: 0,
      effectiveCommitCount: 0,
    });
    expect(showNoCommits).toBe(true);
  });

  it("currentCommitCount가 0이어도 effectiveCommitCount가 0이 아니면 표시되지 않는다", () => {
    // effectiveCommitCount와 currentCommitCount는 다를 수 있다
    const { showNoCommits } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ gridState: makeGrid(0), mode: GAME_MODE.CHALLENGE }),
      restoreChoice: null,
      modeChoice: GAME_MODE.CHALLENGE,
      currentCommitCount: 0,
      effectiveCommitCount: 5,
    });
    expect(showNoCommits).toBe(false);
  });

  it("NORMAL 모드이면 effectiveCommitCount가 0이어도 안내 화면이 표시되지 않는다", () => {
    const { showNoCommits } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ gridState: makeGrid(0), mode: GAME_MODE.NORMAL }),
      restoreChoice: null,
      modeChoice: GAME_MODE.NORMAL,
      currentCommitCount: 0,
      effectiveCommitCount: 0,
    });
    expect(showNoCommits).toBe(false);
  });

  it("restore를 선택했다면 effectiveCommitCount가 0이어도 안내 화면이 표시되지 않는다", () => {
    const { showNoCommits } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ mode: GAME_MODE.CHALLENGE }),
      restoreChoice: "restore",
      modeChoice: null,
      currentCommitCount: 0,
      effectiveCommitCount: 0,
    });
    expect(showNoCommits).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("CHALLENGE 커밋 급감 시 자동 칸 조정 (isResetThreshold)", () => {
  it("currentCommitCount가 30% 이하로 감소하면 자동 조정 대상이 된다", () => {
    const { isResetThreshold } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ commitCount: 10, mode: GAME_MODE.CHALLENGE }),
      currentCommitCount: 3,
      effectiveCommitCount: 3,
    });
    expect(isResetThreshold).toBe(true);
  });

  it("NORMAL 모드이면 커밋이 감소해도 자동 조정되지 않는다", () => {
    const { isResetThreshold } = deriveHomeState({
      ...base,
      savedGridData: savedGrid({ commitCount: 10, mode: GAME_MODE.NORMAL }),
      currentCommitCount: 1,
      effectiveCommitCount: 1,
    });
    expect(isResetThreshold).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("헤더 숨김 조건 (isHeaderVisible)", () => {
  it("유저가 없으면 헤더를 숨긴다 (비로그인 상태)", () => {
    expect(isHeaderVisible(null, "/home")).toBe(false);
  });

  it("/login 경로이면 로그인 상태여도 헤더를 숨긴다", () => {
    expect(isHeaderVisible({ uid: "abc123" }, "/login")).toBe(false);
  });

  it("로그인 상태이고 /login이 아닌 경로면 헤더가 표시된다", () => {
    expect(isHeaderVisible({ uid: "abc123" }, "/home")).toBe(true);
  });

  it("/login을 포함하는 서브패스에서는 헤더가 표시된다", () => {
    // '/login/callback' 같은 경로는 정확히 '/login'이 아님
    expect(isHeaderVisible({ uid: "abc123" }, "/login/callback")).toBe(true);
  });
});
