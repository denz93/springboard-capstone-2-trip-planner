import { useEffect } from "react";
import useTimer from "./use-timer";

export function Disappear({
  children,
  timeout = 1000
}: {
  children: React.ReactNode;
  timeout?: number;
}) {
  const { isTimeout, setTimer } = useTimer();
  useEffect(() => {
    return setTimer(timeout);
  }, [timeout]);

  return <>{!isTimeout && children}</>;
}
