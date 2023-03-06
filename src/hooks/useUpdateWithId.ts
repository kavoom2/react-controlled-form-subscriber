import { useReducer } from "react";

/**
 * maxInt 초과로 인한 리렌더링 이슈 사전 대응
 * @see https://github.com/streamich/react-use/commit/93e72910abf2dafe5bdff625a21f633afd6e52c5
 */
const updateReducer = (num: number) => (num + 1) % 1_000_000;

function useUpdateWithId() {
  const [updateId, forceUpdate] = useReducer(updateReducer, 0);

  return [updateId, forceUpdate] as const;
}

export default useUpdateWithId;
