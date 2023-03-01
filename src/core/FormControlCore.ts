import {
  Comparator,
  Comparators,
  DirtyFields,
  FieldError,
  FieldErrors,
  FieldName,
  FieldValues,
  FormListener,
  FormState,
  SafeValueProcessorParam,
  TouchedFields,
  Validator,
  Validators,
  ValueProcessor,
  ValueProcessors,
} from "../types";

function isEqualError(prevError: FieldError, nextError: FieldError) {
  if (prevError == null && nextError == null) return true;
  return prevError === nextError;
}

function defaultComparator<TValue>(prev: TValue, next: TValue) {
  if (prev == null && next == null) return true;
  return prev === next;
}

function defaultValueProcessor<TRawValue>(nextValue: TRawValue) {
  return nextValue ?? null;
}

const defaultValidator = <TValue>(value: TValue) => null;

class FormControlCore<
  TFieldValues extends FieldValues,
  TFieldValidators extends Validators<TFieldValues> = Validators<TFieldValues>,
  TValueProcessors extends ValueProcessors<TFieldValues> = ValueProcessors<TFieldValues>,
  TComparators extends Comparators<TFieldValues> = Comparators<TFieldValues>
> {
  protected fields: TFieldValues;
  protected errors: FieldErrors<TFieldValues>;
  protected dirtyFields: DirtyFields<TFieldValues>;
  protected touchedFields: TouchedFields<TFieldValues>;

  protected validators: TFieldValidators;
  protected valueProcessors: TValueProcessors;
  protected comparators: TComparators;

  public isValid: boolean;
  public isDirty: boolean;
  public isTouched: boolean;

  protected subscribers: Set<FormListener<TFieldValues>>;

  constructor(
    fields: TFieldValues,
    validators?: TFieldValidators,
    valueProcessors?: TValueProcessors,
    comparators?: TComparators
  ) {
    this.fields = Object.assign({}, fields || null);
    this.errors = {};
    this.validators = Object.assign({}, validators || null);
    this.valueProcessors = Object.assign({}, valueProcessors || null);
    this.comparators = Object.assign({}, comparators || null);
    this.dirtyFields = {};
    this.touchedFields = {};

    this.isValid = false;
    this.isDirty = false;
    this.isTouched = false;

    this.subscribers = new Set();

    this.initialize(fields, validators, valueProcessors, comparators);
  }

  public getState() {
    const fieldState: FormState<TFieldValues> = {
      fields: {
        ...this.fields,
      },
      errors: {
        ...this.errors,
      },
      dirtyFields: {
        ...this.dirtyFields,
      },
      touchedFields: {
        ...this.touchedFields,
      },
      isValid: this.isValid,
      isDirty: this.isDirty,
      isTouched: this.isTouched,
    };

    return fieldState;
  }

  private initialize(
    nextFields: TFieldValues,
    nextValidators?: TFieldValidators,
    nextValueProcessors?: TValueProcessors,
    nextComparators?: TComparators
  ) {
    this.validators = Object.assign({}, nextValidators || null);
    this.valueProcessors = Object.assign({}, nextValueProcessors || null);
    this.comparators = Object.assign({}, nextComparators || null);

    this.fields = Object.assign({}, nextFields || null);
    this.errors = {};
    this.dirtyFields = {};
    this.touchedFields = {};

    this.isValid = false;
    this.isDirty = false;
    this.isTouched = false;

    this.updateErrors(false);
    this.validate();
  }

  public subscribe(listener: FormListener<TFieldValues>) {
    this.subscribers.add(listener);

    return () => {
      this.subscribers.delete(listener);
    };
  }

  private notify(
    prevFormState: FormState<TFieldValues>,
    nextFormState: FormState<TFieldValues>
  ) {
    this.subscribers.forEach((listener) =>
      listener(prevFormState, nextFormState)
    );
  }

  public destroy() {
    this.subscribers.clear();
  }

  private setDirtyFieldsState<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName,
    nextDirty: boolean
  ) {
    this.dirtyFields = {
      ...this.dirtyFields,
      [fieldName]: nextDirty,
    };
  }

  private setTouchedFieldsState<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName,
    nextTouched: boolean
  ) {
    this.touchedFields = {
      ...this.touchedFields,
      [fieldName]: nextTouched,
    };
  }

  private setFieldsState<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName,
    nextValue: TFieldValues[TFieldName]
  ) {
    this.fields = {
      ...this.fields,
      [fieldName]: nextValue,
    };
  }

  private setErrorsState<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName,
    nextError: FieldError
  ) {
    this.errors = {
      ...this.errors,
      [fieldName]: nextError,
    };
  }

  public getValueProcessor<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName
  ) {
    if (this.valueProcessors[fieldName]) {
      return this.valueProcessors[fieldName] as NonNullable<
      TValueProcessors[TFieldName]
    >;
    }

    return defaultValueProcessor as ValueProcessor<TFieldValues, TFieldName>
  }

  public getValidator<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName
  ): Validator<TFieldValues, TFieldName> {
    if (this.validators[fieldName]) {
      return this.validators[fieldName] as NonNullable<
        TFieldValidators[TFieldName]
      >;
    }

    return defaultValidator as Validator<TFieldValues, TFieldName>;
  }

  public getComparator<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName
  ) {
    if (this.comparators[fieldName]) {
      return this.comparators[fieldName] as NonNullable<
        TComparators[TFieldName]
      >;
    }

    return defaultComparator as Comparator<TFieldValues, TFieldName>;
  }

  public getErrorComparator() {
    return isEqualError;
  }

  public getField<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName
  ) {
    return (this.fields[fieldName] ?? this.getValueProcessor(fieldName)(null)) as TFieldValues[TFieldName];
  }

  public getError<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName
  ) {
    return this.errors[fieldName] || null;
  }

  public getDirtyField<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName
  ) {
    return this.dirtyFields[fieldName] || false;
  }

  public getTouchedField<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName
  ) {
    return this.touchedFields[fieldName] || false;
  }

  private getNextField<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName,
    nextRawValue: SafeValueProcessorParam<TValueProcessors[TFieldName], any>
  ) {
    const valueProcessor = this.getValueProcessor(fieldName);

    return valueProcessor(nextRawValue);
  }

  private getNextError<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName,
    nextValue: TFieldValues[TFieldName]
  ) {
    const validator = this.getValidator(fieldName);

    return validator(nextValue);
  }

  private validate() {
    let nextIsValid = true;

    const validatorKeys = Object.keys(
      this.validators
    ) as FieldName<TFieldValues>[];
    const length = validatorKeys.length;

    for (let i = 0; i < length; i++) {
      const fieldName = validatorKeys[i];
      const error = this.getNextError(fieldName, this.getField(fieldName));

      if (error) {
        nextIsValid = false;
        break;
      }
    }

    this.isValid = nextIsValid;
    return this.isValid;
  }

  public updateTouchedField<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName,
    notifyFlag: boolean = false
  ) {
    const prevTouched = this.getTouchedField(fieldName);

    if (prevTouched === true) return;
    const prevFormState = notifyFlag && this.getState();

    this.isTouched = true;
    this.setTouchedFieldsState(fieldName, true);

    if (notifyFlag && prevFormState) {
      const nextFormState = this.getState();
      this.notify(prevFormState, nextFormState);
    }
  }

  public updateDirtyField<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName,
    notifyFlag: boolean = false
  ) {
    const prevDirty = this.getDirtyField(fieldName);

    if (prevDirty === true) return;
    const prevFormState = notifyFlag && this.getState();

    this.updateTouchedField(fieldName, false);

    this.isDirty = true;
    this.setDirtyFieldsState(fieldName, true);

    if (notifyFlag && prevFormState) {
      const nextFormState = this.getState();
      this.notify(prevFormState, nextFormState);
    }
  }

  public updateError<
    TFieldName extends FieldName<TFieldValues>,
    TNextFieldValue extends TFieldValues[TFieldName]
  >(
    fieldName: TFieldName,
    nextValue: TNextFieldValue,
    notifyFlag: boolean = false
  ) {
    const prevError = this.getError(fieldName);
    const nextError = this.getNextError(fieldName, nextValue);

    const errorComparator = this.getErrorComparator();
    if (errorComparator(prevError, nextError)) return;

    const prevFormState = notifyFlag && this.getState();

    this.setErrorsState(fieldName, nextError);

    if (notifyFlag && prevFormState) {
      const nextFormState = this.getState();
      this.notify(prevFormState, nextFormState);
    }
  }

  public updateField<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName,
    nextRawValue: SafeValueProcessorParam<TValueProcessors[TFieldName], any>,
    notifyFlag: boolean
  ) {
    const prevValue = this.getField(fieldName);
    const nextValue = this.getNextField(
      fieldName,
      nextRawValue
    ) as TFieldValues[TFieldName];

    const comparator = this.getComparator(fieldName);
    if (comparator(prevValue, nextValue)) return;

    const prevFormState = notifyFlag && this.getState();

    this.updateDirtyField(fieldName, false);
    this.updateError(fieldName, nextValue, false);
    this.setFieldsState(fieldName, nextValue);

    this.validate();

    if (notifyFlag && prevFormState) {
      const nextFormState = this.getState();
      this.notify(prevFormState, nextFormState);
    }
  }

  public updateErrors(notifyFlag: boolean = false) {
    const maybeNextErrors = [] as {
      fieldName: FieldName<TFieldValues>;
      value: FieldError;
    }[];
    let hasToUpdate = false;

    const fieldNames = Object.keys(
      this.validators
    ) as FieldName<TFieldValues>[];

    fieldNames.forEach((fieldName) => {
      const prevError = this.getError(fieldName);
      const nextError = this.getNextError(fieldName, this.getField(fieldName));

      const errorComparator = this.getErrorComparator();
      if (!errorComparator(prevError, nextError)) {
        hasToUpdate = true;

        maybeNextErrors.push({
          fieldName,
          value: nextError,
        });
      }
    });

    if (!hasToUpdate) return;
    const prevFormState = notifyFlag && this.getState();

    maybeNextErrors.forEach(({ fieldName, value }) => {
      this.setErrorsState(fieldName, value);
    });

    if (notifyFlag && prevFormState) {
      const nextFormState = this.getState();
      this.notify(prevFormState, nextFormState);
    }
  }

  public reset<TFields extends TFieldValues>(maybeNextFields: TFields) {
    const prevFormState = this.getState();

    this.initialize(
      maybeNextFields ?? this.fields,
      this.validators,
      this.valueProcessors,
      this.comparators
    );

    const nextFormState = this.getState();
    this.notify(prevFormState, nextFormState);
  }

  public isFieldStatesEqual<TFieldName extends FieldName<TFieldValues>>(
    fieldName: TFieldName,
    prevFormState: FormState<TFieldValues>,
    nextFormState: FormState<TFieldValues>
  ) {
    const comparator = this.getComparator(fieldName);
    const errorComparator = this.getErrorComparator();

    if (
      comparator(
        prevFormState["fields"][fieldName],
        nextFormState["fields"][fieldName]
      ) &&
      errorComparator(
        prevFormState["errors"][fieldName],
        nextFormState["errors"][fieldName]
      ) &&
      prevFormState["dirtyFields"][fieldName] ===
        nextFormState["dirtyFields"][fieldName] &&
      prevFormState["touchedFields"][fieldName] ===
        nextFormState["touchedFields"][fieldName]
    ) {
      return true;
    }

    return false;
  }

  public isGlobalStatesEqual(
    prevFormState: FormState<TFieldValues>,
    nextFormState: FormState<TFieldValues>
  ) {
    if (
      prevFormState.isValid === nextFormState.isValid &&
      prevFormState.isTouched === nextFormState.isTouched &&
      prevFormState.isDirty === nextFormState.isDirty
    ) {
      return true;
    }

    return false;
  }
}

export default FormControlCore;
