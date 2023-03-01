import { FieldName, FieldValues } from "./fields";

export type ValueProcessor<
  TFieldValues extends FieldValues,
  TFieldName extends FieldName<TFieldValues>
> = (rawValue: any) => TFieldValues[TFieldName];

export type ValueProcessors<TFieldValues extends FieldValues> = {
  [K in FieldName<TFieldValues>]?: ValueProcessor<TFieldValues, K>;
};

export type SafeValueProcessorParam<TMaybeValueProcessor, TFallbackParam> =
  TMaybeValueProcessor extends (rawValue: any) => any
    ? Parameters<TMaybeValueProcessor>[0]
    : TFallbackParam;
