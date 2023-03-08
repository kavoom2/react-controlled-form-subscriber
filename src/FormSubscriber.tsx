import React, { useCallback, useMemo, useRef } from "react";
import FormControlCore from "./core/FormControlCore";
import useIsomorphicLayoutEffect from "./hooks/useIsomorphicLayoutEffect";
import useUpdate from "./hooks/useUpdate";
import useUpdateWithId from "./hooks/useUpdateWithId";
import {
  Comparators,
  FieldError,
  FieldName,
  FieldValues,
  FormListener,
  FormState,
  SafeValueProcessorParam,
  Validators,
  ValueProcessors,
  WacthedFieldValues,
  WatchedFieldNames,
} from "./types";

const isDevelopment = process.env.NODE_ENV !== "production";

export interface FormSubscriberChildProps<
  TFieldValues extends FieldValues,
  TValueProcessors extends ValueProcessors<TFieldValues>,
  TFieldName extends FieldName<TFieldValues>,
  TWatchedFieldNames extends WatchedFieldNames<TFieldValues, TFieldName>
> {
  value: TFieldValues[TFieldName];
  error: FieldError;
  isDirty: boolean;
  isTouched: boolean;
  onChange: (
    nextRawValue: SafeValueProcessorParam<TValueProcessors[TFieldName], any>
  ) => void;
  onTouched: () => void;
  onBlur: () => void;
  register: () => {
    value: TFieldValues[TFieldName];
    onChange: (
      nextRawValue: SafeValueProcessorParam<TValueProcessors[TFieldName], any>
    ) => void;
    onBlur: () => void;
  };
  watchedFields: WacthedFieldValues<
    TFieldValues,
    TFieldName,
    TWatchedFieldNames
  >;
}

export interface FormSubscriberProps<
  TFieldValues extends FieldValues,
  TFieldValidators extends Validators<TFieldValues>,
  TValueProcessors extends ValueProcessors<TFieldValues>,
  TComparators extends Comparators<TFieldValues>,
  TFieldName extends FieldName<TFieldValues>,
  TWatchedFieldNames extends WatchedFieldNames<TFieldValues, TFieldName>
> {
  control: FormControlCore<
    TFieldValues,
    TFieldValidators,
    TValueProcessors,
    TComparators
  >;
  fieldName: TFieldName;
  watchedFieldNames?: TWatchedFieldNames;
  children?:
    | React.ReactNode
    | ((
        props: FormSubscriberChildProps<
          TFieldValues,
          TValueProcessors,
          TFieldName,
          TWatchedFieldNames
        >
      ) => React.ReactNode)
    | undefined;
}

/**
 *
 * @example
 * const defaultFields = { name: '' };
 * const defaultValidators = { name: value => value.length > 0 ? null : 'Name is required' };
 * const defaultValueProcessors = { name: value => value.trim() };
 * const defaultComparators = { name: (prevValue, nextValue) => prevValue === nextValue };
 *
 * const { FormSubscriber, isValid, getFields, control } = useSubscribedForms(defaultFields, defaultValidators, defaultValueProcessors, defaultComparators);
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
const FormSubscriber = <
  TFieldValues extends FieldValues,
  TFieldValidators extends Validators<TFieldValues>,
  TValueProcessors extends ValueProcessors<TFieldValues>,
  TComparators extends Comparators<TFieldValues>,
  TFieldName extends FieldName<TFieldValues>,
  TWatchedFieldNames extends WatchedFieldNames<
    TFieldValues,
    TFieldName
  > = WatchedFieldNames<TFieldValues, TFieldName>
>({
  control,
  fieldName,
  watchedFieldNames,
  children,
}: FormSubscriberProps<
  TFieldValues,
  TFieldValidators,
  TValueProcessors,
  TComparators,
  TFieldName,
  TWatchedFieldNames
>) => {
  const update = useUpdate();
  const [watchExecutionId, updateWatchExecutionId] = useUpdateWithId();

  const stateRef = useRef<FormState<TFieldValues> | null>(null);

  // Effect: 폼의 상태 변화를 구독합니다.
  useIsomorphicLayoutEffect(() => {
    // stateRef를 초기화합니다.
    if (control == null) return;

    if (stateRef.current == null) {
      stateRef.current = control.getState();
    }

    const listener: FormListener<TFieldValues> = (
      _prevFormState,
      nextFormState
    ) => {
      const prevFormState = stateRef.current as FormState<TFieldValues>;

      let shouldUpdateValue = false;
      let shouldUpdateWatchedFields = false;

      // 현재 필드의 상태를 비교합니다.
      if (
        !control.isFieldStatesEqual(fieldName, prevFormState, nextFormState)
      ) {
        shouldUpdateValue = true;
      }

      // 현재 필드를 구독하는 필드의 상태를 비교합니다.
      if (watchedFieldNames && watchedFieldNames.length > 0) {
        for (let i = 0, iMax = watchedFieldNames.length - 1; i <= iMax; i++) {
          const watchedFieldName = watchedFieldNames[i];
          const comparator = control.getComparator(watchedFieldName);

          if (
            !comparator(
              prevFormState["fields"][watchedFieldName],
              nextFormState["fields"][watchedFieldName]
            )
          ) {
            shouldUpdateWatchedFields = true;
            break;
          }
        }
      }

      if (!shouldUpdateValue && !shouldUpdateWatchedFields) {
        return;
      }

      stateRef.current = nextFormState;

      if (shouldUpdateWatchedFields) {
        updateWatchExecutionId();
      } else {
        update();
      }
    };

    const unsubscribe = control.subscribe(listener);

    // 구독 실행 전에 사용자가 폼 상태를 업데이트하면 이를 반영해야 합니다.
    listener(stateRef.current as FormState<TFieldValues>, control.getState());

    return () => {
      unsubscribe();
    };
  }, [
    fieldName,
    control,
    update,
    updateWatchExecutionId,
    ...(watchedFieldNames || []),
  ]);

  // Effect: 리랜더링되면 stateRef를 업데이트합니다.
  useIsomorphicLayoutEffect(() => {
    if (control == null) return;
    stateRef.current = control.getState();
  });

  const onChange = useCallback(
    (
      nextRawValue: SafeValueProcessorParam<TValueProcessors[TFieldName], any>
    ) => {
      control.updateField(fieldName, nextRawValue, true);
    },
    [fieldName, control]
  );

  const onTouched = useCallback(() => {
    control.updateTouchedField(fieldName, true);
  }, [fieldName, control]);

  const onBlur = useCallback(() => {
    control.updateTouchedField(fieldName, true);
  }, [fieldName, control]);

  const value = control.getField(fieldName);
  const error = control.getError(fieldName);
  const isTouched = control.getTouchedField(fieldName);
  const isDirty = control.getDirtyField(fieldName);

  const register = () => ({
    value,
    onChange,
    onBlur,
  });

  // 동일 참조를 보장하기 위해 updateID를 비교합니다.
  const watchedFields = useMemo(() => {
    if (!control || !watchedFieldNames) return null;
    if (watchedFieldNames.length === 0) return null;

    let partialFields = {} as {
      [WatchedFieldName in TWatchedFieldNames[number]]: TFieldValues[WatchedFieldName];
    };

    watchedFieldNames.forEach((watchedFieldName) => {
      partialFields[watchedFieldName] = control.getField(watchedFieldName);
    });

    return partialFields;
  }, [
    watchExecutionId,
    control,
    ...(watchedFieldNames || []),
  ]) as WacthedFieldValues<TFieldValues, TFieldName, TWatchedFieldNames>;

  const props = {
    value,
    error,
    isDirty,
    isTouched,
    onChange,
    onTouched,
    onBlur,
    register,
    watchedFields,
  };

  return <>{typeof children === "function" ? children(props) : children}</>;
};

export default FormSubscriber;
