import { FieldError } from "./errors";
import { FieldName, FieldValues } from "./fields";

export type ValidatorResult = FieldError;

export type Validator<TFieldValues extends FieldValues, TFieldName extends FieldName<TFieldValues>> = (
  value: TFieldValues[TFieldName]
) => ValidatorResult;

export type Validators<TFieldValues extends FieldValues> = {
  [K in FieldName<TFieldValues>]?: Validator<TFieldValues, K>;
};
