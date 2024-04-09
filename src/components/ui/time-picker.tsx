import { useEffect, useState } from "react";
import React from "react";
import { cn } from "@/lib/utils";
type Time = {
  hour: number;
  minute: number;
  ampm: "am" | "pm";
};
function parseTimeStr(time: string | null) {
  if (!time) return null;
  const amTimeRegex =
    /^\s*(0[0-9]|1[0-1]|[0-9])\s*:\s*([0-5][0-9]|[0-9])\s*(am)\s*$/gi;
  const pmTimeRegex =
    /^\s*(0[1-9]|1[0-2]|[1-9])\s*:\s*([0-5][0-9]|[0-9])\s*(pm)\s*$/gi;
  const match1 = [...time.matchAll(amTimeRegex)];
  const match2 = [...time.matchAll(pmTimeRegex)];
  let matcher =
    match1.length > 0 ? match1[0] : match2.length > 0 ? match2[0] : null;
  if (matcher) {
    return {
      hour: +matcher[1],
      minute: +matcher[2],
      ampm: matcher[3] as unknown as "am" | "pm"
    };
  }

  return null;
}

function toTimeStr(time: Partial<Time> | null) {
  if (!time) return "";
  return `${(time.hour ?? 0).toString().padStart(2, "0")}:${(time.minute ?? 0).toString().padStart(2, "0")} ${time.ampm ?? ""}`;
}

function from24hStringTime(time: string | null) {
  if (!time) return null;

  const [hour, minute, second] = time.split(":");
  if (!hour || !minute) return null;
  return {
    hour: +hour > 12 ? +hour - 12 : +hour,
    minute: +minute,
    ampm: +hour > 12 ? "pm" : "am"
  } as Time;
}
function to24hStringTime(time: Partial<Time> | null) {
  if (time?.ampm === "pm") {
    return `${((time?.hour === 12 ? 0 : time?.hour) ?? 0) + 12}:${(time.minute ?? "").toString().padStart(2, "0")}:00`;
  }
  if (time?.ampm === "am") {
    return `${(time.hour ?? "").toString().padStart(2, "0")}:${(time.minute ?? "").toString().padStart(2, "0")}:00`;
  }
  return undefined;
}

export default function TimePicker({
  onTimeChange,
  className,
  time = null,
  stepMinute = 15,
  ...props
}: React.ComponentPropsWithoutRef<"input"> & {
  stepMinute?: number;
  time?: string | null;
  onTimeChange?: (time?: Partial<Time> | null, time24hString?: string) => void;
}) {
  const [value, setValue] = useState<Partial<Time> | null>(
    from24hStringTime(time)
  );
  const [inputValue, setInputValue] = useState(
    toTimeStr(from24hStringTime(time))
  );
  useEffect(() => {
    setValue(from24hStringTime(time));
    setInputValue(toTimeStr(from24hStringTime(time)));
  }, [time]);
  return (
    <div
      className={cn("group relative input input-bordered px-0", className)}
      onBlur={(e) => {
        if (e.currentTarget.contains(e.relatedTarget)) {
          return;
        }
        setInputValue(toTimeStr(value));
        onTimeChange?.(value, to24hStringTime(value));
      }}
    >
      <input
        className={cn(
          "bg-transparent relative input my-auto focus:border-0 w-full h-full"
        )}
        onKeyDown={(e) => {
          if (
            (e.key >= "0" && e.key <= "9") ||
            [
              "Backspace",
              "a",
              "A",
              "p",
              "P",
              "m",
              "M",
              ":",
              " ",
              "ArrowLeft",
              "ArrowRight"
            ].includes(e.key)
          ) {
            return;
          }
          e.preventDefault();
        }}
        onChange={(e) => {
          const inputValue = e.target.value;
          setInputValue(inputValue);
          const validTime = parseTimeStr(inputValue);
          if (!validTime) return;
          setValue(validTime);
        }}
        value={inputValue}
        {...props}
      />
      <div
        tabIndex={1}
        className="absolute w-full z-50 bg-base-100 invisible group-focus-within:visible h-48 grid grid-cols-3 font-mono border border-border rounded-md"
      >
        <div className="col-start-1 col-span-1 bg-base-200 font-bold flex place-items-center place-content-center py-2">
          Hour
        </div>
        <div className="col-start-2 col-span-1 bg-base-200 font-bold flex place-items-center place-content-center py-2">
          Minute
        </div>
        <div className="col-start-3 col-span-1 bg-base-200 font-bold flex place-items-center place-content-center"></div>

        <div className="flex flex-col h-full overflow-y-scroll">
          {new Array(13).fill(0).map((_, idx) => (
            <div
              className={
                "flex justify-center py-1 " +
                (value?.hour === idx ? " bg-base-300 " : " ") +
                (value?.ampm === "pm" && idx === 0
                  ? " line-through opacity-50 pointer-events-none "
                  : "") +
                (value?.ampm === "am" && idx === 12
                  ? " line-through opacity-50 pointer-events-none "
                  : "")
              }
              key={`h${idx}`}
              onClick={() => setValue({ ...(value ?? {}), hour: idx })}
            >
              {`${idx}`.padStart(2, "0")}
            </div>
          ))}
        </div>

        <div className="flex flex-col h-full overflow-y-scroll">
          {new Array(Math.floor(60 / stepMinute)).fill(0).map((_, idx) => (
            <div
              className={
                "flex justify-center py-1 " +
                (value?.minute === idx * stepMinute ? " bg-base-300" : "")
              }
              key={`m${idx}`}
              onClick={() => setValue({ ...value, minute: idx * stepMinute })}
            >
              {`${idx * stepMinute}`.padStart(2, "0")}
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          <div
            className={
              "py-1 text-center" +
              (value?.ampm === "am" ? " bg-base-300 " : " ") +
              (value?.hour === 12
                ? " line-through opacity-50 pointer-events-none"
                : " ")
            }
            onClick={() =>
              value?.hour !== 12 && setValue({ ...value, ampm: "am" })
            }
          >
            AM
          </div>
          <div
            className={
              "py-1 text-center" +
              (value?.ampm === "pm" ? " bg-base-300" : "") +
              (value?.hour === 0
                ? " line-through opacity-50 pointer-events-none"
                : "")
            }
            onClick={() =>
              value?.hour !== 0 && setValue({ ...value, ampm: "pm" })
            }
          >
            PM
          </div>
        </div>

        <div className="col-start-1 col-span-3 text-center py-2 border-t-border border-t opacity-50">
          {toTimeStr(value)}
        </div>
      </div>
    </div>
  );
}
