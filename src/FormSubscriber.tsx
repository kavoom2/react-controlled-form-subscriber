import { useCallback, useEffect } from "react";
import FormControlCore from "./core/FormControlCore";
import useUpdate from "./hooks/useUpdate";
import {
    Comparators,
    FieldError,
    FieldName,
    FieldValues,
    FormListener,
    SafeValueProcessorParam,
    Validators,
    ValueProcessors,
} from "./types";

export interface FormSubscriberChildProps<
  TFieldValues extends FieldValues,
  TValueProcessors extends ValueProcessors<TFieldValues>,
  TFieldName extends FieldName<TFieldValues>
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
}

export interface FormSubscriberProps<
  TFieldValues extends FieldValues,
  TFieldValidators extends Validators<TFieldValues>,
  TValueProcessors extends ValueProcessors<TFieldValues>,
  TComparators extends Comparators<TFieldValues>,
  TFieldName extends FieldName<TFieldValues>
> {
  control: FormControlCore<
    TFieldValues,
    TFieldValidators,
    TValueProcessors,
    TComparators
  >;
  fieldName: TFieldName;
  children: (
    props: FormSubscriberChildProps<TFieldValues, TValueProcessors, TFieldName>
  ) => JSX.Element;
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
  TFieldName extends FieldName<TFieldValues>
>({
  control,
  fieldName,
  children,
}: FormSubscriberProps<
  TFieldValues,
  TFieldValidators,
  TValueProcessors,
  TComparators,
  TFieldName
>): JSX.Element | null => {
  const update = useUpdate();

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

  const props = {
    value,
    error,
    isDirty,
    isTouched,
    onChange,
    onTouched,
    onBlur,
    register,
  };

  return typeof children === "function" ? children(props) : null;
};

export default FormSubscriber;
