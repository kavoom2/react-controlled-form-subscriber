<div align="center">
    <h1>📝 react-controlled-form-subscriber</h1>
    <img src="/docs/example-1.gif" alt="React controlled form subscriber demos" width="30%"/>
    <br/>
    <br/>
    <a href="https://react-controlled-form-subscriber-i97e-81zbd66lo-kavoom2.vercel.app/">
    <img src="https://img.shields.io/badge/demos-%F0%9F%9A%80-yellow">
    </a>
</div>

---

### Introduction

[react-hook-form](https://github.com/react-hook-form/react-hook-form)의 [Controller](https://react-hook-form.com/api/usecontroller/controller/)를 모방한 제어 컴포넌트 방식의 폼 관리 Hook과 Component입니다.

- FormSubscriber로 해당 필드의 상태만을 구독하여, 폼 상태 관리에서 불필요한 리렌더링을 최소화합니다.
- 유효성 검사, 수정 여부 등 간단한 폼 관련 상태 및 유틸 함수 기능을 제공합니다.

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
| fields          | Record<string, any>                                                 | 폼 필드 값들의 초기 상태를 정의합니다.                                                                                                               |
| validators      | Record<string, (value: unknown) => string \| null>                  | 각 필드 별 유효성 검사 함수를 정의합니다.<br><br>정의되지 않은 필드에 대해서는 항상 null을 반환합니다.                                               |
| valueProcessors | Record<string, (rawValue: unknown) => unknown>                      | FormSubscriber의 onChange에서 인자로 받은 값을 가공하여 필드의 값으로 할당합니다.<br><br>정의되지 않은 필드에 대해서는 rawValue를 그대로 사용합니다. |
| comparators     | Record<string, (prevValue: unknown, nextValue: unknown) => boolean> | 해당 필드의 값을 비교하기 위해 사용합니다.<br><br>정의되지 않은 필드에 대해서는 prevValue === nextValue의 결과값을 사용합니다.                       |

##### Properties

| Props name       | Type                                               | Description                                                                                                             |
| :--------------- | :------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| isValid          | boolean                                            | 폼의 유효성 검사 결과입니다.                                                                                            |
| isTouched        | boolean                                            | 폼의 필드 요소가 사용자에 의해 선택 되었는지를 나타냅니다.                                                              |
| isDirty          | boolean                                            | 폼의 필드 내용이 사용자에 의해 수정 되었는지 여부를 나타냅니다.                                                         |
| control          | FormControlCore                                    | 폼을 관리하는 상태와 메서드가 담긴 Core 인스턴스입니다. FormSubscriber에게 전달하기 위해 사용합니다.                    |
| onChange         | (fieldName: string) => (rawValue: unknown) => void | 필드 외부에서 onChange를 호출하기 위해 사용합니다.<br><br>(대부분의 경우는 FormSubscriber의 Props를 사용하면 됩니다.)   |
| onTouched        | (fieldName: string) => () => void                  | 필드 외부에서 onFocus 등을 호출하기 위해 사용합니다.<br><br>(대부분의 경우는 FormSubscriber의 Props를 사용하면 됩니다.) |
| getFields        | () => Record<string, any>                          | 현재 폼 Field들의 값을 반환합니다.                                                                                      |
| getErrors        | () => Record<string, string \| null>               | 현재 폼 Field들의 오류를 반환합니다.<br>(어떤 필드 Property의 값이 null 또는 존재하지 않으면 유효한 필드입니다.)        |
| getTouchedFields | () => Record<string, boolean>                      | 현재 폼 Field들의 Focus 상호작용 여부를 반환합니다.                                                                     |
| getDirtyFields   | () => Record<string, boolean>                      | 현재 폼 Field들의 수정 여부를 반환합니다.                                                                               |
| getField         | (fieldName: string) => unknown                     | 해당 Field의 값을 반환합니다.                                                                                           |
| getError         | (fieldName: string) => string \| null              | 해당 Field의 오류 내용을 반환합니다.                                                                                    |
| getTouchedField  | (fieldName: string) => boolean                     | 해당 Field의 Focus 상호작용 여부를 반환합니다.                                                                          |
| getDirtyField    | (fieldName: string) => boolean                     | 해당 Field의 수정 여부를 반환합니다.                                                                                    |
| reset            | (nextFields: Record<string, unknown>) => void      | 현재 폼 Field들의 값을 초기화합니다.                                                                                    |

#### FormSubscriber

##### Properties

| Props name | Type                                             | Description                                                                                |
| :--------- | :----------------------------------------------- | :----------------------------------------------------------------------------------------- |
| control    | FormControlCore                                  | 폼을 관리하는 상태와 메서드가 담긴 Core 인스턴스입니다. useSubscribedForm 에서 제공합니다. |
| fieldName  | string                                           | Subscriber가 폼 상태에서 구독할 Field의 이름입니다.                                        |
| children   | (props: FormSubscriberChildProps) => JSX.Element | 필드의 상태와 관련 메소드를 Props로 받아 구성 요소를 렌더링합니다.                         |
