import { useCallback, useState } from "react";

export default function useTimer() {
  const [isIdle, setIsIdle] = useState(true);
  const [isTiming, setIsTiming] = useState(false);
  const [isTimeout, setIsTimeout] = useState(false);
  const [timeoutId, setTimeOutId] = useState<number | null>(null);

  const setTimer = useCallback(
    (ms = 1000) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      const newTimeout = setTimeout(() => {
        setIsTimeout(true);
        setIsTiming(false);
      }, ms);
      setTimeOutId(newTimeout as any);
      setIsIdle(false);
      setIsTiming(true);
      setIsTimeout(false);
      return () => clearTimeout(newTimeout);
    },
    [timeoutId]
  );

  return {
    setTimer,
    isIdle,
    isTimeout,
    isTiming
  };
}
