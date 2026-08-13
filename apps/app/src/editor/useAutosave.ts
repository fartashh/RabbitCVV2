import { useCallback, useEffect, useRef } from "react";

/**
 * KAN-3: "autosaves as you type." Returns a function that, when called
 * repeatedly, only actually invokes `save` after `delayMs` of quiet —
 * standard debounce, kept tiny/dependency-free rather than pulling in
 * lodash for one function.
 */
export function useAutosave<T>(save: (value: T) => void, delayMs = 800) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return useCallback(
    (value: T) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => saveRef.current(value), delayMs);
    },
    [delayMs]
  );
}
