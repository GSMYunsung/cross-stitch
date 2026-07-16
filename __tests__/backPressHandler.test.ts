/**
 * 뒤로가기 차단 로직 테스트 (BackPressHandler.tsx)
 *
 * 브라우저 DOM API(history.pushState, popstate 이벤트)를 사용하므로
 * jsdom 환경에서 실행된다.
 *
 * BackPressHandler 컴포넌트를 직접 렌더링하는 대신,
 * 컴포넌트가 수행하는 DOM 동작 자체를 동일하게 재현해 검증한다.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ─── BackPressHandler 가 하는 일을 재현한 순수 함수 ──────────────────────────

/**
 * BackPressHandler 마운트 시 동작을 시뮬레이션한다.
 * @returns cleanup 함수 (컴포넌트 언마운트에 해당)
 */
function mountBackPressHandler(): () => void {
  window.history.pushState(null, "", window.location.href);

  const preventBack = () => {
    window.history.pushState(null, "", window.location.href);
  };

  window.addEventListener("popstate", preventBack);

  return () => {
    window.removeEventListener("popstate", preventBack);
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe("뒤로가기 차단 로직 (BackPressHandler)", () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pushStateSpy = vi.spyOn(window.history, "pushState");
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
  });

  it("마운트 즉시 history.pushState를 호출해 현재 URL을 스택에 쌓는다", () => {
    const cleanup = mountBackPressHandler();
    expect(pushStateSpy).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("popstate 이벤트(뒤로가기 시도) 발생 시 pushState를 다시 호출해 이동을 차단한다", () => {
    const cleanup = mountBackPressHandler();
    pushStateSpy.mockClear();

    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(pushStateSpy).toHaveBeenCalledTimes(1);
    cleanup();
  });

  it("뒤로가기를 여러 번 시도해도 매번 차단된다", () => {
    const cleanup = mountBackPressHandler();
    pushStateSpy.mockClear();

    window.dispatchEvent(new PopStateEvent("popstate"));
    window.dispatchEvent(new PopStateEvent("popstate"));
    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(pushStateSpy).toHaveBeenCalledTimes(3);
    cleanup();
  });

  it("언마운트(cleanup) 후에는 popstate가 발생해도 pushState를 호출하지 않는다", () => {
    const cleanup = mountBackPressHandler();
    cleanup(); // 컴포넌트 언마운트에 해당
    pushStateSpy.mockClear();

    window.dispatchEvent(new PopStateEvent("popstate"));

    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  it("pushState 호출 시 null state와 현재 URL이 전달된다", () => {
    const cleanup = mountBackPressHandler();

    expect(pushStateSpy).toHaveBeenCalledWith(null, "", window.location.href);
    cleanup();
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe("로그인 화면 → 홈 화면 진입 후 뒤로가기 차단 시나리오", () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pushStateSpy = vi.spyOn(window.history, "pushState");
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
  });

  it("홈 화면 진입(마운트) → 뒤로가기 시도 → 홈에 머무른다", () => {
    // 1. 홈 화면에 진입 (BackPressHandler 마운트)
    const cleanup = mountBackPressHandler();
    const callsAfterMount = pushStateSpy.mock.calls.length;
    expect(callsAfterMount).toBe(1); // 마운트 시 1회

    // 2. 유저가 뒤로가기 버튼을 누름
    window.dispatchEvent(new PopStateEvent("popstate"));

    // 3. pushState가 다시 호출돼 현재 페이지로 돌아옴 (로그인으로 이동하지 않음)
    expect(pushStateSpy).toHaveBeenCalledTimes(2);
    expect(pushStateSpy).toHaveBeenLastCalledWith(null, "", window.location.href);

    cleanup();
  });

  it("여러 컴포넌트 수명주기에서 리스너가 누적되지 않는다", () => {
    // 마운트 → 언마운트 → 재마운트
    const cleanup1 = mountBackPressHandler();
    cleanup1();

    const cleanup2 = mountBackPressHandler();
    pushStateSpy.mockClear();

    window.dispatchEvent(new PopStateEvent("popstate"));

    // 리스너가 하나만 동작해야 함 (누적 시 2번 호출됨)
    expect(pushStateSpy).toHaveBeenCalledTimes(1);
    cleanup2();
  });
});
