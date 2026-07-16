/**
 * BackPressHandler 컴포넌트 동작 테스트
 *
 * 실제 컴포넌트를 마운트/언마운트해 DOM 동작을 검증한다.
 * 로직을 복사하지 않으므로 컴포넌트 구현이 바뀌면 테스트도 반드시 깨진다.
 */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import BackPressHandler from "../app/src/components/BackPressHandler";

describe("BackPressHandler — 마운트 동작", () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pushStateSpy = vi.spyOn(window.history, "pushState");
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
  });

  it("마운트 즉시 history.pushState를 호출해 현재 URL을 스택에 쌓는다", () => {
    const { unmount } = render(<BackPressHandler />);

    expect(pushStateSpy).toHaveBeenCalledOnce();
    expect(pushStateSpy).toHaveBeenCalledWith(null, "", window.location.href);
    unmount();
  });

  it("popstate 이벤트(뒤로가기 시도) 발생 시 pushState를 재호출해 이동을 차단한다", () => {
    const { unmount } = render(<BackPressHandler />);
    pushStateSpy.mockClear();

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(pushStateSpy).toHaveBeenCalledOnce();
    expect(pushStateSpy).toHaveBeenCalledWith(null, "", window.location.href);
    unmount();
  });

  it("뒤로가기를 여러 번 시도해도 매번 차단된다", () => {
    const { unmount } = render(<BackPressHandler />);
    pushStateSpy.mockClear();

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.dispatchEvent(new PopStateEvent("popstate"));
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(pushStateSpy).toHaveBeenCalledTimes(3);
    unmount();
  });
});

describe("BackPressHandler — 언마운트(cleanup) 동작", () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pushStateSpy = vi.spyOn(window.history, "pushState");
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
  });

  it("언마운트 후에는 popstate가 발생해도 pushState를 호출하지 않는다", () => {
    const { unmount } = render(<BackPressHandler />);
    unmount(); // useEffect cleanup → 리스너 제거
    pushStateSpy.mockClear();

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  it("마운트 → 언마운트 → 재마운트해도 리스너가 누적되지 않는다", () => {
    const { unmount: unmount1 } = render(<BackPressHandler />);
    unmount1();

    const { unmount: unmount2 } = render(<BackPressHandler />);
    pushStateSpy.mockClear();

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // 리스너가 누적됐다면 2번 이상 호출됨
    expect(pushStateSpy).toHaveBeenCalledOnce();
    unmount2();
  });
});

describe("BackPressHandler — 로그인→홈 시나리오", () => {
  let pushStateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    pushStateSpy = vi.spyOn(window.history, "pushState");
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
  });

  it("홈 진입 후 뒤로가기를 눌러도 로그인 화면으로 이동하지 않는다", () => {
    // 1. 홈 화면 진입 — BackPressHandler 마운트
    const { unmount } = render(<BackPressHandler />);
    expect(pushStateSpy).toHaveBeenCalledTimes(1);

    // 2. 유저가 뒤로가기 버튼 누름
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // 3. pushState 재호출로 현재 페이지 유지
    expect(pushStateSpy).toHaveBeenCalledTimes(2);
    expect(pushStateSpy).toHaveBeenLastCalledWith(null, "", window.location.href);

    unmount();
  });
});
