import { act, renderHook } from "@testing-library/react";
import useUpdate from "./useUpdate";

describe("useUpdate", () => {
  it("훅이 호출되면 update 함수를 반환해야 합니다.", () => {
    const { result } = renderHook(() => useUpdate());

    expect(typeof result.current).toBe("function");
  });

  it("update 함수를 호출하면 리렌더링이 발생해야 합니다.", () => {
    let renderCount = 0;

    const {
      result: { current: update },
    } = renderHook(() => {
      renderCount++;
      return useUpdate();
    });

    expect(renderCount).toBe(1);

    act(() => update());
    expect(renderCount).toBe(2);

    act(() => update());
    expect(renderCount).toBe(3);
  });

  it("리렌더링 이후에도 update 함수는 동일해야 합니다.", () => {
    let renderCount = 0;

    const { result } = renderHook(() => {
      renderCount++;
      return useUpdate();
    });
    let initialUpdate = result.current;

    expect(renderCount).toBe(1);

    act(() => result.current());
    expect(renderCount).toBe(2);
    expect(initialUpdate).toBe(result.current);

    act(() => result.current());
    expect(renderCount).toBe(3);
    expect(initialUpdate).toBe(result.current);
  });
});
