import { useMemo, useRef, useState } from "react";
import FormControlCore from "./core/FormControlCore";
import useIsomorphicLayoutEffect from "./hooks/useIsomorphicLayoutEffect";
import useUpdate from "./hooks/useUpdate";
import {
  Comparators,
  FieldName,
  FieldValues,
  FormListener,
  Validators,
  ValueProcessors,
} from "./types";

/**
 *
 * @param defaultFields Field 별 초기값입니다.
 * @param defaultValidators Field 별 유효성 검사 함수입니다. 오류일 때 ERROR 문자열을 출력하며, 오류가 아닐 때는 null을 반환합니다.
 *                                        - 기본값: (nextValue) => null
 * @param defaultValueProcessors Field 별 값 처리 함수입니다. 입력된 값을 처리하여 반환합니다.
 *                                                  - 기본값: (nextRawValue) => nextRawValue
 * @param defaultComparators Field 별 값 비교 함수입니다. 이전 값과 다음 값을 비교하여 변경 여부를 반환합니다.
 *                                          - 기본값: (prevValue, nextValue) => (prevValue == null && nextValue == null) || (prevValue === nextValue)
 *
 * @example
 * const defaultFields = { name: '' };
 * const defaultValidators = { name: value => value.length > 0 ? null : 'Name is required' };
 * const defaultValueProcessors = { name: value => value.trim() };
 * const defaultComparators = { name: (prevValue, nextValue) => prevValue === nextValue };
 *
 * const { FormSubscriber, isValid, getFields, control } = useSubscribedForm(defaultFields, defaultValidators, defaultValueProcessors, defaultComparators);
 *
 * const onSubmit = () => {
 *  if (!isValid) return;
 *
 *  const fields = getFields();
 *  // do something with fields...
 * }
 *
 * return (
 *  <form onSubmit={onSubmit}>
 *    <FormSubscriber fieldName="name" control={control}>
 *      {({ value, error, isDirty, isTouched, onChange, onTouched, onBlur, register }) => (
 *        <div>
 *          <input
 *            value={value}
 *            onChange={e => onChange(e.target.value)}
 *            onBlur={onBlur}
 *          />
 *
 *         {(error && isDirty) && <div>{error}</div>}
 *        </div>
 *     )}
 *    </FormSubscriber>
 *  </form>
 * )
 */
const useSubscribedForm = <TFieldValues extends FieldValues>(
  defaultFields: TFieldValues,
  defaultValidators?: Validators<TFieldValues>,
  defaultValueProcessors?: ValueProcessors<TFieldValues>,
  defaultComparators?: Comparators<TFieldValues>
) => {
  const update = useUpdate();

  const [formControlCore] = useState(
    () =>
      new FormControlCore(
        defaultFields,
        defaultValidators,
        defaultValueProcessors,
        defaultComparators
      )
  );

  const state = formControlCore.getState();
  const stateRef = useRef(state);

  // Effect: 폼의 상태 변화를 구독합니다.
  useIsomorphicLayoutEffect(() => {
    const listener: FormListener<TFieldValues> = (
      _unusedPrevFormState,
      nextFormState
    ) => {
      const prevFormState = stateRef.current;

      if (formControlCore.isGlobalStatesEqual(prevFormState, nextFormState)) {
        return;
      }

      stateRef.current = nextFormState;
      update();
    };

    const unsubscribe = formControlCore.subscribe(listener);

    // 구독 실행 전에 사용자가 폼 상태를 업데이트하면 이를 반영해야 합니다.
    listener(stateRef.current, formControlCore.getState());

    return () => {
      unsubscribe();
    };
  }, [formControlCore, update]);

  // Effect: 리랜더링되면 stateRef를 업데이트합니다.
  useIsomorphicLayoutEffect(() => {
    stateRef.current = state;
  });

  const apis = useMemo(
    () => ({
      onChange:
        <TFieldName extends FieldName<TFieldValues>>(fieldName: TFieldName) =>
        (
          nextRawValue: Parameters<typeof formControlCore["updateField"]>[1]
        ) => {
          formControlCore.updateField(fieldName, nextRawValue, true);
        },
      onTouched:
        <TFieldName extends FieldName<TFieldValues>>(fieldName: TFieldName) =>
        () => {
          formControlCore.updateTouchedField(fieldName, true);
        },
      onBlur:
        <TFieldName extends FieldName<TFieldValues>>(fieldName: TFieldName) =>
        () => {
          formControlCore.updateTouchedField(fieldName, true);
        },
      getFields: () => {
        const states = formControlCore.getState();
        return states.fields;
      },
      getErrors: () => {
        const states = formControlCore.getState();
        return states.errors;
      },
      getTouchedFields: () => {
        const states = formControlCore.getState();
        return states.touchedFields;
      },
      getDirtyFields: () => {
        const states = formControlCore.getState();
        return states.dirtyFields;
      },
      getField: <TFieldName extends FieldName<TFieldValues>>(
        fieldName: TFieldName
      ) => {
        return formControlCore.getField(fieldName);
      },
      getError: <TFieldName extends FieldName<TFieldValues>>(
        fieldName: TFieldName
      ) => {
        return formControlCore.getError(fieldName);
      },
      getTouchedField: <TFieldName extends FieldName<TFieldValues>>(
        fieldName: TFieldName
      ) => {
        return formControlCore.getTouchedField(fieldName);
      },
      getDirtyField: <TFieldName extends FieldName<TFieldValues>>(
        fieldName: TFieldName
      ) => {
        return formControlCore.getDirtyField(fieldName);
      },
      reset: <TFields extends TFieldValues>(maybeNextFields: TFields) => {
        formControlCore.reset(maybeNextFields);
      },
    }),
    [formControlCore]
  );

  return {
    ...apis,
    isValid: formControlCore.isValid,
    isTouched: formControlCore.isTouched,
    isDirty: formControlCore.isDirty,
    control: formControlCore,
  };
};

export default useSubscribedForm;
