<div align="center">
    <h1>๐ react-controlled-form-subscriber</h1>
    <img src="/docs/example-1.gif" alt="React controlled form subscriber demos" width="30%"/>
    <br/>
    <br/>
    <a href="https://react-controlled-form-subscriber.vercel.app/">
    <img src="https://img.shields.io/badge/demos-%F0%9F%9A%80-yellow">
    </a>
</div>

---

### Introduction

[react-hook-form](https://github.com/react-hook-form/react-hook-form)์ [Controller](https://react-hook-form.com/api/usecontroller/controller/)๋ฅผ ๋ชจ๋ฐฉํ ์ ์ด ์ปดํฌ๋ํธ ๋ฐฉ์์ ํผ ๊ด๋ฆฌ Hook๊ณผ Component์๋๋ค.

- FormSubscriber๋ก ํด๋น ํ๋์ ์ํ๋ง์ ๊ตฌ๋ํ์ฌ, ํผ ์ํ ๊ด๋ฆฌ์์ ๋ถํ์ํ ๋ฆฌ๋ ๋๋ง์ ์ต์ํํฉ๋๋ค.
- ์ ํจ์ฑ ๊ฒ์ฌ, ์์  ์ฌ๋ถ ๋ฑ ๊ฐ๋จํ ํผ ๊ด๋ จ ์ํ ๋ฐ ์ ํธ ํจ์ ๊ธฐ๋ฅ์ ์ ๊ณตํฉ๋๋ค.

### Install

```
npm install react-controlled-form-subscriber
```

### Usage

```js
import {
  FormSubscriber,
  useSubscribedForm,
} from "react-controlled-form-subscriber";

const getDefaultFields = () => ({
  name: "",
  age: 0,
});

const defaultFields = getDefaultFields();

const validators = {
  name: (value) => (value.length > 0 ? null : "Name is required"),
  age: (value) => (value > 0 ? null : "Age is required"),
};

const valueProcessors = {
  name: (event) => {
    const value = event.target.value;
    return value.trim();
  },
  age: (event) => {
    const value = event.target.value;
    return parseInt(value, 10);
  }
};


const MyForm = () => {
  const { control, getFields, reset } =
    useSubscribedForm(defaultFields, validators, valueProcessors);

  const onSubmit = (event) => {
    event.preventDefault();

    const fields = getFields();
    // Do anything with field values...
  };

  const onReset = (event) => {
    event.preventDefault();

    reset(getDefaultFields());
  };

  return (
    <form onSubmit={onSubmit}>
        <FormSubscriber control={control} fieldName="name">
          {({ register, error }) => {
            return (
              <>
                <input
                  type="text"
                  {...register()}
                />

                {error && <p>{error}</p>}
              </>
            );
          }}
        </FormSubscriber>
      </div>

      <FormSubscriber control={control} fieldName="age">
        {({ register, error }) => {
          return (
            <>
              <input
                type="number"
                {...register()}
              />

              {error && <p>{error}</p>}
            </>
          );
        }}
      </FormSubscriber>

      <div className="form-footer">
        <button type="submit" onClick={onSubmit}>
          Submit
        </button>

        <button type="button" onClick={onReset}>
          Reset
        </button>
    </form>
  );
};
```

### API

#### useSubscribedForm

##### Arguments

| Arguments name  | Type                                                                | Description                                                                                                                                          |
| :-------------- | :------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| fields          | Record<string, unknown>                                             | ํผ ํ๋ ๊ฐ๋ค์ ์ด๊ธฐ ์ํ๋ฅผ ์ ์ํฉ๋๋ค.                                                                                                               |
| validators      | Record<string, (value: unknown) => string \| null>                  | ๊ฐ ํ๋ ๋ณ ์ ํจ์ฑ ๊ฒ์ฌ ํจ์๋ฅผ ์ ์ํฉ๋๋ค.<br><br>์ ์๋์ง ์์ ํ๋์ ๋ํด์๋ ํญ์ null์ ๋ฐํํฉ๋๋ค.                                               |
| valueProcessors | Record<string, (rawValue: unknown) => unknown>                      | FormSubscriber์ onChange์์ ์ธ์๋ก ๋ฐ์ ๊ฐ์ ๊ฐ๊ณตํ์ฌ ํ๋์ ๊ฐ์ผ๋ก ํ ๋นํฉ๋๋ค.<br><br>์ ์๋์ง ์์ ํ๋์ ๋ํด์๋ rawValue๋ฅผ ๊ทธ๋๋ก ์ฌ์ฉํฉ๋๋ค. |
| comparators     | Record<string, (prevValue: unknown, nextValue: unknown) => boolean> | ํด๋น ํ๋์ ๊ฐ์ ๋น๊ตํ๊ธฐ ์ํด ์ฌ์ฉํฉ๋๋ค.<br><br>์ ์๋์ง ์์ ํ๋์ ๋ํด์๋ prevValue === nextValue์ ๊ฒฐ๊ณผ๊ฐ์ ์ฌ์ฉํฉ๋๋ค.                       |

##### Properties

| Props name       | Type                                               | Description                                                                                                             |
| :--------------- | :------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| isValid          | boolean                                            | ํผ์ ์ ํจ์ฑ ๊ฒ์ฌ ๊ฒฐ๊ณผ์๋๋ค.                                                                                            |
| isTouched        | boolean                                            | ํผ์ ํ๋ ์์๊ฐ ์ฌ์ฉ์์ ์ํด ์ ํ ๋์๋์ง๋ฅผ ๋ํ๋๋๋ค.                                                              |
| isDirty          | boolean                                            | ํผ์ ํ๋ ๋ด์ฉ์ด ์ฌ์ฉ์์ ์ํด ์์  ๋์๋์ง ์ฌ๋ถ๋ฅผ ๋ํ๋๋๋ค.                                                         |
| control          | FormControlCore                                    | ํผ์ ๊ด๋ฆฌํ๋ ์ํ์ ๋ฉ์๋๊ฐ ๋ด๊ธด Core ์ธ์คํด์ค์๋๋ค. FormSubscriber์๊ฒ ์ ๋ฌํ๊ธฐ ์ํด ์ฌ์ฉํฉ๋๋ค.                    |
| onChange         | (fieldName: string) => (rawValue: unknown) => void | ํ๋ ์ธ๋ถ์์ onChange๋ฅผ ํธ์ถํ๊ธฐ ์ํด ์ฌ์ฉํฉ๋๋ค.<br><br>(๋๋ถ๋ถ์ ๊ฒฝ์ฐ๋ FormSubscriber์ Props๋ฅผ ์ฌ์ฉํ๋ฉด ๋ฉ๋๋ค.)   |
| onTouched        | (fieldName: string) => () => void                  | ํ๋ ์ธ๋ถ์์ onFocus ๋ฑ์ ํธ์ถํ๊ธฐ ์ํด ์ฌ์ฉํฉ๋๋ค.<br><br>(๋๋ถ๋ถ์ ๊ฒฝ์ฐ๋ FormSubscriber์ Props๋ฅผ ์ฌ์ฉํ๋ฉด ๋ฉ๋๋ค.) |
| getFields        | () => Record<string, unknown>                      | ํ์ฌ ํผ Field๋ค์ ๊ฐ์ ๋ฐํํฉ๋๋ค.                                                                                      |
| getErrors        | () => Record<string, string \| null>               | ํ์ฌ ํผ Field๋ค์ ์ค๋ฅ๋ฅผ ๋ฐํํฉ๋๋ค.<br>(์ด๋ค ํ๋ Property์ ๊ฐ์ด null ๋๋ ์กด์ฌํ์ง ์์ผ๋ฉด ์ ํจํ ํ๋์๋๋ค.)        |
| getTouchedFields | () => Record<string, boolean>                      | ํ์ฌ ํผ Field๋ค์ Focus ์ํธ์์ฉ ์ฌ๋ถ๋ฅผ ๋ฐํํฉ๋๋ค.                                                                     |
| getDirtyFields   | () => Record<string, boolean>                      | ํ์ฌ ํผ Field๋ค์ ์์  ์ฌ๋ถ๋ฅผ ๋ฐํํฉ๋๋ค.                                                                               |
| getField         | (fieldName: string) => unknown                     | ํด๋น Field์ ๊ฐ์ ๋ฐํํฉ๋๋ค.                                                                                           |
| getError         | (fieldName: string) => string \| null              | ํด๋น Field์ ์ค๋ฅ ๋ด์ฉ์ ๋ฐํํฉ๋๋ค.                                                                                    |
| getTouchedField  | (fieldName: string) => boolean                     | ํด๋น Field์ Focus ์ํธ์์ฉ ์ฌ๋ถ๋ฅผ ๋ฐํํฉ๋๋ค.                                                                          |
| getDirtyField    | (fieldName: string) => boolean                     | ํด๋น Field์ ์์  ์ฌ๋ถ๋ฅผ ๋ฐํํฉ๋๋ค.                                                                                    |
| reset            | (nextFields: Record<string, unknown>) => void      | ํ์ฌ ํผ Field๋ค์ ๊ฐ์ ์ด๊ธฐํํฉ๋๋ค.                                                                                    |

#### FormSubscriber

##### Properties

| Props name    | Type                                           | Description                                                                                |
| :------------ | :--------------------------------------------- | :----------------------------------------------------------------------------------------- |
| control       | FormControlCore                                | ํผ์ ๊ด๋ฆฌํ๋ ์ํ์ ๋ฉ์๋๊ฐ ๋ด๊ธด Core ์ธ์คํด์ค์๋๋ค. useSubscribedForm ์์ ์ ๊ณตํฉ๋๋ค. |
| fieldName     | string                                         | Subscriber๊ฐ ํผ ์ํ์์ ๊ตฌ๋ํ  Field์ ์ด๋ฆ์๋๋ค.                                        |
| children      | (props: FormSubscriberChildProps) => ReactNode | ํ๋์ ์ํ์ ๊ด๋ จ ๋ฉ์๋๋ฅผ Props๋ก ๋ฐ์ ๊ตฌ์ฑ ์์๋ฅผ ๋ ๋๋งํฉ๋๋ค.                         |
| watchedFields | string[]                                       | ํ์ฌ ํ๋ ์ธ์ ๋ค๋ฅธ ํ๋ ๊ฐ์ ๋ณ๊ฒฝ์ ๊ตฌ๋ํฉ๋๋ค.                                           |
