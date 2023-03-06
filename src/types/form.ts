import { FieldErrors } from "./errors";
import { FieldName, FieldValues } from "./fields";

export type DirtyFields<TFieldValues extends FieldValues> = {
  [K in FieldName<TFieldValues>]?: boolean;
};

export type TouchedFields<TFieldValues extends FieldValues> = {
  [K in FieldName<TFieldValues>]?: boolean;
};

export type FormState<TFieldValues extends FieldValues> = {
  fields: TFieldValues;
  errors: FieldErrors<TFieldValues>;
  dirtyFields: DirtyFields<TFieldValues>;
  touchedFields: TouchedFields<TFieldValues>;
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
};

export type FormListener<TFieldValues extends FieldValues> = (
  prevState: FormState<TFieldValues>,
  nextState: FormState<TFieldValues>
) => void;


export type WatchedFieldNames<TFieldValues extends FieldValues, TFieldName extends FieldName<TFieldValues>> = Exclude<FieldName<TFieldValues>[], TFieldName>

export type WacthedFieldValues<TFieldValues extends FieldValues, TFieldName extends FieldName<TFieldValues>, TWatchedFieldNames> = TWatchedFieldNames extends WatchedFieldNames<TFieldValues, TFieldName> ? {
  [WatchedFieldName in TWatchedFieldNames[number]]: TFieldValues[WatchedFieldName];
}
: null