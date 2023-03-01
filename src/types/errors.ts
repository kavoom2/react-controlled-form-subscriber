import { FieldName, FieldValues } from "./fields";

export type FieldError = string | null | undefined;

export type FieldErrors<TFieldValues extends FieldValues = FieldValues> = {
  [K in FieldName<TFieldValues>]?: FieldError;
};
