"use client";

import {
  Dispatch,
  SetStateAction,
  useState,
  createContext,
  useContext,
  useCallback,
  useId,
  useEffect
} from "react";
import useTimer from "./use-timer";

type Alert = {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration: number;
  onRemove: (id: string) => void;
};
const AlertContext = createContext<
  [Alert[], Dispatch<SetStateAction<Alert[]>>]
>([[], () => {}]);

function uuid() {
  return crypto.randomUUID();
}
const alertVarriants = {
  success: "alert-success",
  error: "alert-error",
  info: "alert-info",
  warning: "alert-warning"
};

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const state = useState<Alert[]>([]);
  const [alerts] = state;
  console.log(`Rendering ${alerts.length} alerts`);
  return (
    <AlertContext.Provider value={state}>
      <div className="fixed top-0 right-0 z-50 grid grid-cols-1 gap-y-2">
        {alerts.map((alert) => (
          <AlertRender key={alert.id} alert={alert} />
        ))}
      </div>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const [_, setAlerts] = useContext(AlertContext);

  const push = useCallback(
    ({
      message = "",
      type = "info",
      duration = 7000
    }: Partial<Omit<Alert, "id" | "onRemove">>) => {
      setAlerts((alerts) => [
        ...alerts,
        {
          message,
          type,
          id: uuid(),
          duration,
          onRemove: (id) =>
            setAlerts((alerts) => alerts.filter((alert) => alert.id !== id))
        }
      ]);
    },
    [setAlerts]
  );

  return push;
}

function AlertRender({ alert }: { alert: Alert }) {
  const { setTimer, isTimeout, isTiming } = useTimer();
  const [isReadyGone, setIsReadyGone] = useState(false);
  useEffect(() => {
    return setTimer(alert.duration);
  }, []);
  useEffect(() => {
    if (!isTimeout) return;
    const timeoutId = setTimeout(() => {
      setIsReadyGone(true), alert.onRemove?.(alert.id);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [isTimeout]);
  return (
    <div
      className={
        `${isReadyGone ? "hidden  absolute" : " relative opacity-10"} left-full transition duration-500 alert ${alertVarriants[alert.type]} ` +
        (isTiming ? "-translate-x-full !opacity-100" : "")
      }
    >
      {alert.message}
    </div>
  );
}
