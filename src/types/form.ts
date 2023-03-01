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
