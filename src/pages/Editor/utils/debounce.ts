import { useEffect, useRef } from "react";

export const useDebouncedCallback = <Args extends unknown[]>(
  fn: (...args: Args) => void,
  delay: number
) => {
  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return (...args: Args) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fnRef.current(...args);
    }, delay);
  };
};
