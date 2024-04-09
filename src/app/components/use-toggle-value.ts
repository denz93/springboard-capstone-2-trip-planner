import { useCallback, useState } from "react";

export function useToggleValue<T>(initialValue: T | undefined) {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(
    (newValueOrCallback: T | ((oldValue: T | undefined) => T)) => {
      setValue((oldValue) => {
        if (newValueOrCallback instanceof Function) {
          const newValue = newValueOrCallback(oldValue);
          if (newValue === oldValue) return undefined;
          return newValue;
        }
        if (newValueOrCallback === oldValue) return undefined;
        return newValueOrCallback;
      });
    },
    []
  );
  return [value, toggle] as const;
}
