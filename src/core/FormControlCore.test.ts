import { act } from "@testing-library/react";
import {
  comparators,
  fields,
  validators,
  valueProcessors,
} from "../tests/datasets";
import FormControlCore from "./FormControlCore";

describe("FormControlCore", () => {
  let formControlCore: FormControlCore<
    typeof fields,
    typeof validators,
    typeof valueProcessors,
    typeof comparators
  >;

  type TestFormState = ReturnType<typeof formControlCore.getState>;

  beforeEach(() => {
    formControlCore = new FormControlCore(
      fields,
      validators,
      valueProcessors,
      comparators
    );
  });

  it("defaultFields 값을 가지고 초기화되어야 합니다.", () => {
    const { fields: currentFields } = formControlCore.getState();

    const nameComparator = formControlCore.getComparator("name");
    const ageComparator = formControlCore.getComparator("age");
    const addressComparator = formControlCore.getComparator("address");
    const dataComparator = formControlCore.getComparator("data");

    expect(nameComparator(currentFields.name, fields.name)).toBe(true);
    expect(ageComparator(currentFields.age, fields.age)).toBe(true);
    expect(addressComparator(currentFields.address, fields.address)).toBe(true);
    expect(dataComparator(currentFields.data, fields.data)).toBe(true);
  });

  it("defaultFields와 defaultValidators를 가지고 errors와 isValid가 초기화되어야 합니다.", () => {
    const { errors, isValid } = formControlCore.getState();
    const nameValidator = formControlCore.getValidator("name");
    const ageValidator = formControlCore.getValidator("age");
    const addressValidator = formControlCore.getValidator("address");
    const dataValidator = formControlCore.getValidator("data");

    expect(errors.name).toBe(nameValidator(fields.name));
    expect(errors.age).toBe(ageValidator(fields.age));
    expect(errors.address).toBe(addressValidator(fields.address));
    expect(errors.data).toBe(dataValidator(fields.data));

    expect(isValid).toBe(
      Object.values(errors).reduce(
        (acc, fieldError) => acc && fieldError == null,
        true
      )
    );
  });

  it("특정 필드의 updateField를 호출하면 해당 필드의 valueProcessor를 거쳐야 합니다.", () => {
    const nextName = " My next name :) ";

    act(() => {
      formControlCore.updateField("name", nextName);
    });

    expect(formControlCore.getField("name")).toBe(
      valueProcessors.name(nextName)
    );
  });

  it("defaultFields의 필드를 기준으로 dirtyFields, touchedFields, isDirty, isTouced는 초기화되어야 합니다.", () => {
    const { dirtyFields, isDirty, touchedFields, isTouched } =
      formControlCore.getState();

    expect(Object.keys(dirtyFields).length).toBe(Object.keys(fields).length);
    expect(
      Object.values(dirtyFields).every((isFieldDirty) => isFieldDirty === false)
    ).toBe(true);
    expect(isDirty).toBe(false);

    expect(Object.keys(touchedFields).length).toBe(Object.keys(fields).length);
    expect(
      Object.values(touchedFields).every(
        (isFieldTouched) => isFieldTouched === false
      )
    ).toBe(true);
    expect(isTouched).toBe(false);
  });

  it("특정 필드의 updateField를 호출하면 해당 필드의 field, error, isDirty, isTouched가 변경되어야 합니다.", () => {
    const nextName = "My next name :)";

    act(() => {
      formControlCore.updateField("name", nextName);
    });

    expect(formControlCore.getField("name")).toBe(nextName);
    expect(formControlCore.getError("name")).toBe(null);
    expect(formControlCore.getDirtyField("name")).toBe(true);
    expect(formControlCore.getTouchedField("name")).toBe(true);
  });

  it("특정 필드의 updateTouchedField를 호출하면 해당 필드의 isTouched와 전역 상태 isTouched가 변경되어야 합니다.", () => {
    act(() => {
      formControlCore.updateTouchedField("name");
    });

    const { isTouched } = formControlCore.getState();

    expect(formControlCore.getTouchedField("name")).toBe(true);
    expect(isTouched).toBe(true);
  });

  it("특정 필드의 updateDirtyField를 호출하면 해당 필드의 isTouched, isDirty와 전역 상태 isTouched, isDirty가 변경되어야 합니다.", () => {
    act(() => {
      formControlCore.updateDirtyField("name");
    });

    const { isDirty, isTouched } = formControlCore.getState();

    expect(formControlCore.getDirtyField("name")).toBe(true);
    expect(formControlCore.getTouchedField("name")).toBe(true);
    expect(isDirty).toBe(true);
    expect(isTouched).toBe(true);
  });

  it("reset을 호출하면 폼 state가 초기화되어야 합니다.", () => {
    const nextFields: typeof fields = {
      name: "My next name",
      age: 30,
      address: "My next address",
      data: {
        key: "My next key",
        value: "My next value",
      },
    };

    act(() => {
      formControlCore.updateField("name", "Not my next name");
      formControlCore.reset(nextFields);
    });

    const {
      fields: currentFields,
      errors,
      isValid,
      isDirty,
      isTouched,
    } = formControlCore.getState();

    const nameComparator = formControlCore.getComparator("name");
    const ageComparator = formControlCore.getComparator("age");
    const addressComparator = formControlCore.getComparator("address");
    const dataComparator = formControlCore.getComparator("data");

    expect(nameComparator(currentFields.name, nextFields.name)).toBe(true);
    expect(ageComparator(currentFields.age, nextFields.age)).toBe(true);
    expect(addressComparator(currentFields.address, nextFields.address)).toBe(
      true
    );
    expect(dataComparator(currentFields.data, nextFields.data)).toBe(true);

    const nameValidator = formControlCore.getValidator("name");
    const ageValidator = formControlCore.getValidator("age");
    const addressValidator = formControlCore.getValidator("address");
    const dataValidator = formControlCore.getValidator("data");

    expect(errors.name).toBe(nameValidator(nextFields.name));
    expect(errors.age).toBe(ageValidator(nextFields.age));
    expect(errors.address).toBe(addressValidator(nextFields.address));
    expect(errors.data).toBe(dataValidator(nextFields.data));

    expect(isValid).toBe(
      Object.values(errors).reduce(
        (acc, fieldError) => acc && fieldError == null,
        true
      )
    );

    expect(formControlCore.getDirtyField("name")).toBe(false);
    expect(isDirty).toBe(false);

    expect(formControlCore.getTouchedField("name")).toBe(false);
    expect(isTouched).toBe(false);
  });

  it("isFieldStatesEqual을 호출하면 전달된 두 개의 필드 상태가 같은지 비교하여 반환해야 합니다.", () => {
    const fieldState1 = {
      fields: {
        data: {
          key: "key1",
          value: "value1",
        },
      },
      errors: {
        data: null,
      },
      dirtyFields: {
        data: false,
      },
      touchedFields: {
        data: false,
      },
    } as TestFormState;

    const fieldState2 = {
      fields: {
        ...fieldState1.fields,
      },
      errors: {
        ...fieldState1.errors,
      },
      dirtyFields: {
        ...fieldState1.dirtyFields,
      },
      touchedFields: {
        ...fieldState1.touchedFields,
      },
    } as TestFormState;

    const fieldState3 = {
      fields: {
        data: {
          key: "key2",
          value: "value2",
        },
      },
      errors: {
        ...fieldState1.errors,
      },
      dirtyFields: {
        ...fieldState1.dirtyFields,
      },
      touchedFields: {
        ...fieldState1.touchedFields,
      },
    } as TestFormState;

    const fieldState4 = {
      fields: {
        ...fieldState1.fields,
      },
      errors: {
        data: "ERROR",
      },
      dirtyFields: {
        ...fieldState1.dirtyFields,
      },
      touchedFields: {
        ...fieldState1.touchedFields,
      },
    } as TestFormState;

    const fieldState5 = {
      fields: {
        ...fieldState1.fields,
      },
      errors: {
        ...fieldState1.errors,
      },
      dirtyFields: {
        data: true,
      },
      touchedFields: {
        ...fieldState1.touchedFields,
      },
    } as TestFormState;

    const fieldState6 = {
      fields: {
        ...fieldState1.fields,
      },
      errors: {
        ...fieldState1.errors,
      },
      dirtyFields: {
        ...fieldState1.dirtyFields,
      },
      touchedFields: {
        data: true,
      },
    } as TestFormState;

    expect(
      formControlCore.isFieldStatesEqual("data", fieldState1, fieldState2)
    ).toBe(true);
    expect(
      formControlCore.isFieldStatesEqual("data", fieldState1, fieldState3)
    ).toBe(false);
    expect(
      formControlCore.isFieldStatesEqual("data", fieldState1, fieldState4)
    ).toBe(false);
    expect(
      formControlCore.isFieldStatesEqual("data", fieldState1, fieldState5)
    ).toBe(false);
    expect(
      formControlCore.isFieldStatesEqual("data", fieldState1, fieldState6)
    ).toBe(false);
  });

  it("isGlobalStatesEqual을 호출하면 전달된 두 개의 전역 상태가 같은지 비교하여 반환해야 합니다.", () => {
    const globalState1 = {
      isValid: false,
      isDirty: false,
      isTouched: false,
    } as TestFormState;

    const globalState2 = {
      ...globalState1,
    } as TestFormState;

    const globalState3 = {
      ...globalState1,
      isValid: true,
    } as TestFormState;

    const globalState4 = {
      ...globalState1,
      isDirty: true,
    } as TestFormState;

    const globalState5 = {
      ...globalState1,
      isTouched: true,
    } as TestFormState;

    expect(
      formControlCore.isGlobalStatesEqual(globalState1, globalState2)
    ).toBe(true);

    expect(
      formControlCore.isGlobalStatesEqual(globalState1, globalState3)
    ).toBe(false);

    expect(
      formControlCore.isGlobalStatesEqual(globalState1, globalState4)
    ).toBe(false);

    expect(
      formControlCore.isGlobalStatesEqual(globalState1, globalState5)
    ).toBe(false);
  });
});
