import { act, renderHook } from "@testing-library/react";
import {
  comparators,
  fields,
  validators,
  valueProcessors,
} from "./tests/datasets";
import useSubscribedForm from "./useSubscribedForm";

describe("useSubscribedForm", () => {
  it("폼의 전역 상태의 변경 사항을 반영할 수 있어야 합니다.", () => {
    const { result } = renderHook(() => {
      return useSubscribedForm(
        fields,
        validators,
        valueProcessors,
        comparators
      );
    });

    act(() => {
      result.current.onChange("name")("");
    });

    expect(result.current.isTouched).toBe(true);
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isValid).toBe(false);
  });

  it("Listener를 등록하기 전에 발생한 폼의 상태 변화를 반영해야 합니다.", () => {
    let renderCount = 0;

    const { result } = renderHook(() => {
      renderCount += 1;

      const returns = useSubscribedForm(
        fields,
        validators,
        valueProcessors,
        comparators
      );

      returns.onChange("name")("");

      return returns;
    });

    expect(result.current.isTouched).toBe(true);
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isValid).toBe(false);
    expect(renderCount).toBe(2);
  });

  it("Listener를 등록하기 전에 폼의 상태 변화가 발생하더라도 폼 전역 상태에 변화가 없으면 리렌더링하지 않아야 합니다.", () => {
    let renderCount = 0;

    renderHook(() => {
      renderCount += 1;

      const returns = useSubscribedForm(
        fields,
        validators,
        valueProcessors,
        comparators
      );

      returns.reset({
        name: "my next name",
        age: 10,
        address: "my any adress",
        data: {
          key: "key 2",
          value: "value 2",
        },
      });

      return returns;
    });

    expect(renderCount).toBe(1);
  });
});
