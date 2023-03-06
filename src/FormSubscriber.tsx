import React, { useCallback, useEffect, useMemo } from "react";
import FormControlCore from "./core/FormControlCore";
import useUpdate from "./hooks/useUpdate";
import useUpdateWithId from "./hooks/useUpdateWithId";
import {
  Comparators,
  FieldError,
  FieldName,
  FieldValues,
  FormListener,
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
  TWatchedFieldNames extends Exclude<
    FieldName<TFieldValues>[],
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
  const [id, updateId] = useUpdateWithId();

  // Effect: FieldName의 상태 변화를 구독합니다.
  useEffect(() => {
    if (!control) return;

    const listener: FormListener<TFieldValues> = (
      prevFormState,
      nextFormState
    ) => {
      if (control.isFieldStatesEqual(fieldName, prevFormState, nextFormState)) {
        return;
      }

      update();
    };

    const unsubscribe = control.subscribe(listener);

    return () => {
      unsubscribe();
    };
  }, [control, fieldName, update]);

  // Effect: 해당 FieldName 이외의 다른 FieldName들의 값을 구독합니다.
  useEffect(() => {
    if (!control || !watchedFieldNames) return;
    if (watchedFieldNames.length === 0) return;

    if (isDevelopment) {
      if (watchedFieldNames.includes(fieldName)) {
        console.warn(
          `FormSubscriber: watchedFieldNames에는 fieldName(${fieldName})을 제외한 필드 명만 사용할 수 있습니다.`
        );
      }
    }

    const listener: FormListener<TFieldValues> = (
      prevFormState,
      nextFormState
    ) => {
      let isEveryFieldsEqual = true;

      for (let i = 0, iMax = watchedFieldNames.length - 1; i <= iMax; i++) {
        const watchedFieldName = watchedFieldNames[i];
        const comparator = control.getComparator(watchedFieldName);

        if (
          !comparator(
            prevFormState["fields"][watchedFieldName],
            nextFormState["fields"][watchedFieldName]
          )
        ) {
          isEveryFieldsEqual = false;
          break;
        }
      }

      if (isEveryFieldsEqual) return;
      updateId();
    };

    const unsubscribe = control.subscribe(listener);

    return () => {
      unsubscribe();
    };
  }, [control, fieldName, updateId, ...(watchedFieldNames || [])]);

  const onChange = useCallback(
    (
      nextRawValue: SafeValueProcessorParam<TValueProcessors[TFieldName], any>
    ) => {
      control.updateField(fieldName, nextRawValue, true);
    },
    [control, fieldName]
  );

  const onTouched = useCallback(() => {
    control.updateTouchedField(fieldName, true);
  }, [control, fieldName]);

  const onBlur = useCallback(() => {
    control.updateTouchedField(fieldName, true);
  }, [control, fieldName]);

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
  }, [id, control, ...(watchedFieldNames || [])]) as WacthedFieldValues<
    TFieldValues,
    TFieldName,
    TWatchedFieldNames
  >;

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
