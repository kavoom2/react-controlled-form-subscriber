import useUpdateWithId from "./useUpdateWithId";

function useUpdate() {
  return useUpdateWithId()[1];
}

export default useUpdate;
