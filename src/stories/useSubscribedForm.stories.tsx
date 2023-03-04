import { storiesOf } from "@storybook/react";
import * as React from "react";
import FormSubscriber from "../FormSubscriber";
import useSubscribedForm from "../useSubscribedForm";

const getDefaultFields = () => ({
  name: "",
  age: 0,
  email: "",
  password: "",
});

const fields = getDefaultFields();

const validators = {
  name: (value: string) => (value.length > 0 ? null : "Name is required"),
  age: (value: number) => (value > 0 ? null : "Age is required"),
  email: (value: string) => (value.length > 0 ? null : "Email is required"),
  password: (value: string) =>
    value.length > 0 ? null : "Password is required",
};

const valueProcessors = {
  name: (event: React.SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value;
    return value.trim();
  },
  age: (event: React.SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value;
    return parseInt(value, 10);
  },
  email: (event: React.SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value;
    return value.trim();
  },
  password: (event: React.SyntheticEvent) => {
    const value = (event.target as HTMLInputElement).value;
    return value.trim();
  },
};

const comparators = {
  name: (prevValue: string, nextValue: string) => prevValue === nextValue,
  age: (prevValue: number, nextValue: number) => prevValue === nextValue,
  email: (prevValue: string, nextValue: string) => prevValue === nextValue,
  password: (prevValue: string, nextValue: string) => prevValue === nextValue,
};

const Demo = () => {
  const { control, isValid, isTouched, isDirty, getFields, reset } =
    useSubscribedForm(fields, validators, valueProcessors, comparators);

  const onSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();

    alert(JSON.stringify(getFields()));
  };

  const onReset = (event: React.SyntheticEvent) => {
    event.preventDefault();

    reset(getDefaultFields());
  };

  return (
    <form onSubmit={onSubmit}>
      <div>Validation result: {isValid ? "TRUE" : "FALSE"}</div>
      <div>Has touched before: {isTouched ? "TRUE" : "FALSE"}</div>
      <div>Has edited before: {isDirty ? "TRUE" : "FALSE"}</div>

      <FormSubscriber control={control} fieldName="name">
        {({ register, onTouched }) => {
          return (
            <input
              type="text"
              onFocus={onTouched}
              {...register()}
              placeholder="Name"
            />
          );
        }}
      </FormSubscriber>

      <FormSubscriber control={control} fieldName="age">
        {({ register, onTouched }) => {
          return (
            <input
              type="number"
              onFocus={onTouched}
              {...register()}
              placeholder="Age"
            />
          );
        }}
      </FormSubscriber>

      <FormSubscriber control={control} fieldName="email">
        {({ register, onTouched }) => {
          return (
            <input
              type="text"
              onFocus={onTouched}
              {...register()}
              placeholder="Email"
            />
          );
        }}
      </FormSubscriber>

      <FormSubscriber control={control} fieldName="password">
        {({ register, onTouched }) => {
          return (
            <input
              type="password"
              onFocus={onTouched}
              {...register()}
              placeholder="Password"
            />
          );
        }}
      </FormSubscriber>

      <button type="submit" onClick={onSubmit}>
        Submit
      </button>
      <button type="button" onClick={onReset}>
        Reset
      </button>
    </form>
  );
};

storiesOf("State/useSubscribedForm", module).add("Demo", () => <Demo />);
