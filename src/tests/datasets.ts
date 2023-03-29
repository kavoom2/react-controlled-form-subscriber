export const fields = {
  name: "name",
  age: 20,
  address: "address",
  data: {
    key: "key",
    value: "value",
  },
};

export const validators = {
  name: (value: string) => {
    return value.length > 0 ? null : "Name is required";
  },
  age: (value: number) => {
    return value > 0 ? null : "Age is required";
  },
};

export const valueProcessors = {
  name: (value: string) => {
    return value.trim();
  },
  age: (value: number) => {
    return value > 0 ? value : 0;
  },
};

export const comparators = {
  name: (prevValue: string, nextValue: string) => {
    return prevValue === nextValue;
  },
  data: (
    prevValue: { key: string; value: string },
    nextValue: { key: string; value: string }
  ) => {
    return (
      prevValue.key === nextValue.key && prevValue.value === nextValue.value
    );
  },
};
