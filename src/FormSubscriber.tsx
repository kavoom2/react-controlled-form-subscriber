import React, { useCallback, useRef } from "react";
import FormControlCore from "./core/FormControlCore";
import useIsomorphicLayoutEffect from "./hooks/useIsomorphicLayoutEffect";
import useUpdate from "./hooks/useUpdate";
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

  const state = control ? control.getState() : null;
  const stateRef = useRef<FormState<TFieldValues> | null>(state);

  // Effect: ?????? ?????? ????????? ???????????????.
  useIsomorphicLayoutEffect(() => {
    // stateRef??? ??????????????????.
    if (control == null) return;

    if (stateRef.current == null) {
      stateRef.current = state;
    }

    const listener: FormListener<TFieldValues> = (
      _unusedPrevFormState,
      nextFormState
    ) => {
      const prevFormState = stateRef.current as FormState<TFieldValues>;

      // ?????? ????????? ????????? ???????????????.
      if (
        fieldName &&
        !control.isFieldStatesEqual(fieldName, prevFormState, nextFormState)
      ) {
        stateRef.current = nextFormState;
        update();

        return;
      }

      // ?????? ????????? ???????????? ????????? ????????? ???????????????.
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
            stateRef.current = nextFormState;
            update();

            return;
          }
        }
      }
    };

    const unsubscribe = control.subscribe(listener);

    // ?????? ?????? ?????? ???????????? ??? ????????? ?????????????????? ?????? ???????????? ?????????.
    listener(stateRef.current as FormState<TFieldValues>, control.getState());

    return () => {
      unsubscribe();
    };
  }, [fieldName, control, update, ...(watchedFieldNames || [])]);

  // Effect: ?????????????????? stateRef??? ?????????????????????.
  useIsomorphicLayoutEffect(() => {
    if (state != null) {
      stateRef.current = state;
    }
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

  const watchedFieldsRef =
    useRef<WacthedFieldValues<
      TFieldValues,
      TFieldName,
      TWatchedFieldNames
    > | null>(null);

  const getNextWatchedFields = () => {
    if (
      !control ||
      !stateRef.current ||
      !state ||
      !watchedFieldNames ||
      watchedFieldNames?.length === 0
    ) {
      return null;
    }

    if (watchedFieldsRef.current) {
      // ?????? ????????? ???????????? ?????? ?????? ????????? ?????? ??????????????? ?????? ?????? ???????????????.
      // watchedFields??? ???????????? ?????? sideEffect??? ???????????? ????????? ?????????.
      let isEqual = true;
      const prevWatchedFields = watchedFieldsRef.current;

      for (let i = 0, iMax = watchedFieldNames.length - 1; i <= iMax; i++) {
        const watchedFieldName = watchedFieldNames[i];
        const comparator = control.getComparator(watchedFieldName);

        if (
          !comparator(
            prevWatchedFields[watchedFieldName],
            state["fields"][watchedFieldName]
          )
        ) {
          isEqual = false;
          break;
        }
      }

      if (isEqual) {
        return prevWatchedFields;
      }
    }

    // ????????? ?????? ???????????????.
    let partialFields = {} as {
      [WatchedFieldName in TWatchedFieldNames[number]]: TFieldValues[WatchedFieldName];
    };

    for (let i = 0, iMax = watchedFieldNames.length - 1; i <= iMax; i++) {
      const watchedFieldName = watchedFieldNames[i];
      partialFields[watchedFieldName] = state["fields"][watchedFieldName];
    }

    return partialFields as WacthedFieldValues<
      TFieldValues,
      TFieldName,
      TWatchedFieldNames
    >;
  };

  watchedFieldsRef.current = getNextWatchedFields();
  const watchedFields = watchedFieldsRef.current as WacthedFieldValues<
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
