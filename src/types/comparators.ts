import { FieldName, FieldValues } from "./fields";

export type Comparator<
  TFieldValues extends FieldValues,
  TFieldName extends FieldName<TFieldValues>
> = (
  prevValue: TFieldValues[TFieldName],
  nextValue: TFieldValues[TFieldName]
) => boolean;

export type Comparators<
  TFieldValues extends FieldValues> = {
  [K in FieldName<TFieldValues>]?: Comparator<TFieldValues, K>;
};
