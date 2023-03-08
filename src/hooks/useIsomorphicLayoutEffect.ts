import { useEffect, useLayoutEffect } from "react";

const canUseDOM  = !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement);

export default canUseDOM ? useLayoutEffect : useEffect;