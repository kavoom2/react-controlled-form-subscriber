import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import FormSubscriber from "./FormSubscriber";
import {
  comparators,
  fields,
  validators,
  valueProcessors,
} from "./tests/datasets";
import useSubscribedForm from "./useSubscribedForm";

const BasicTester = () => {
  const { control } = useSubscribedForm(
    fields,
    validators,
    valueProcessors,
    comparators
  );

  return (
    <div>
      <FormSubscriber fieldName="name" control={control}>
        {({
          value,
          error,
          isDirty,
          isTouched,
          onChange,
          onTouched,
          onBlur,
        }) => (
          <div>
            <input
              type="text"
              aria-label="input-name"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              onFocus={onTouched}
            />
            <div aria-label="value-name">{value}</div>
            <div aria-label="error-name">{error}</div>
            <div aria-label="dirty-name">{isDirty ? "Y" : "N"}</div>
            <div aria-label="touched-name">{isTouched ? "Y" : "N"}</div>
          </div>
        )}
      </FormSubscriber>

      <FormSubscriber
        fieldName="address"
        control={control}
        watchedFieldNames={["name"]}
      >
        {({ watchedFields }) => (
          <>
            <div aria-label="watched-value-name">{watchedFields.name}</div>
          </>
        )}
      </FormSubscriber>
    </div>
  );
};

describe("FormSubscriber", () => {
  it("fieldName 필드의 변경 사항을 구독합니다.", () => {
    render(<BasicTester />);

    const nameInput = screen.getByLabelText("input-name");
    const nextRawNameValue = "";
    const nextNameValue = valueProcessors.name(nextRawNameValue);

    fireEvent.focus(nameInput);
    expect(screen.getByLabelText("touched-name")).toHaveTextContent("Y");

    fireEvent.change(nameInput, { target: { value: nextRawNameValue } });

    expect(screen.getByLabelText("value-name")).toHaveTextContent(
      nextNameValue
    );
    expect(screen.getByLabelText("error-name").textContent).toBe(
      validators.name(nextNameValue)
    );
    expect(screen.getByLabelText("dirty-name")).toHaveTextContent("Y");
  });

  it("watchedFieldNames에 지정된 필드의 변경 사항을 구독합니다.", () => {
    render(<BasicTester />);

    const nameInput = screen.getByLabelText("input-name");

    expect(screen.getByLabelText("watched-value-name")).toHaveTextContent(
      fields.name
    );

    const nextRawNameValue = "test";
    const nextNameValue = valueProcessors.name(nextRawNameValue);

    fireEvent.change(nameInput, { target: { value: nextRawNameValue } });

    expect(screen.getByLabelText("watched-value-name")).toHaveTextContent(
      nextNameValue
    );
  });

  it("watchedFieldNames는 구독하는 필드의 값이 변경되지 않으면, 항상 참조 동일성을 보장해야 합니다.", () => {
    let initialWatchedFields: any;
    let updatedWatchedFields: any;

    const WatchedFieldsTester = () => {
      const { control } = useSubscribedForm(
        fields,
        validators,
        valueProcessors,
        comparators
      );

      return (
        <div>
          <FormSubscriber fieldName="name" control={control}>
            {({ value, onChange }) => (
              <input
                type="text"
                aria-label="input-name"
                value={value}
                onChange={(e) => onChange(e.target.value)}
              />
            )}
          </FormSubscriber>

          <FormSubscriber
            fieldName="address"
            control={control}
            watchedFieldNames={["name"]}
          >
            {({ watchedFields }) => {
              if (!initialWatchedFields) {
                initialWatchedFields = watchedFields;
              } else {
                updatedWatchedFields = watchedFields;
              }
              return null;
            }}
          </FormSubscriber>
        </div>
      );
    };

    const { rerender } = render(<WatchedFieldsTester />);
    rerender(<WatchedFieldsTester />);
    rerender(<WatchedFieldsTester />);

    expect(initialWatchedFields).toBe(updatedWatchedFields);

    const nameInput = screen.getByLabelText("input-name");
    const nextRawNameValue = "test";

    fireEvent.change(nameInput, { target: { value: nextRawNameValue } });

    expect(initialWatchedFields).not.toBe(updatedWatchedFields);
  });

  it("Listener가 등록되기 이전에 발생한 상태 변화를 반영해야 합니다.", () => {
    let isMounted = false;
    const nextRawNameValue = "test";
    const nextNameValue = valueProcessors.name(nextRawNameValue);

    const ListenerTester = () => {
      const { control, onChange: onChangeGlobal } = useSubscribedForm(
        fields,
        validators,
        valueProcessors,
        comparators
      );

      return (
        <div>
          <FormSubscriber fieldName="name" control={control}>
            {({ value, onChange }) => {
              if (!isMounted) {
                onChangeGlobal("name")(nextRawNameValue);
                isMounted = true;
              }

              return (
                <input
                  type="text"
                  aria-label="input-name"
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                />
              );
            }}
          </FormSubscriber>
        </div>
      );
    };

    render(<ListenerTester />);

    expect(screen.getByLabelText("input-name")).toHaveValue(nextNameValue);
  });
});
