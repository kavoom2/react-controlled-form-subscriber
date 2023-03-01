export type FieldValues = Record<string, any>;

export type FieldName<TFieldValues extends FieldValues> =
  | Exclude<keyof TFieldValues, number | symbol>;

export type FieldValue<TFieldValues extends FieldValues> =
  TFieldValues[FieldName<TFieldValues>];
