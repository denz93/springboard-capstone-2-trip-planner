"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange, DayPickerRangeProps } from "react-day-picker/dist";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { useWindowSize } from "@uidotdev/usehooks";
export function DatePickerWithRange({
  className,
  initialRange,
  onSelect,
  ...props
}: Omit<DayPickerRangeProps, "mode" | "selected"> & {
  initialRange?: DateRange;
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(initialRange);
  const windowSize = useWindowSize();
  const formatDateString =
    (windowSize.width ?? 0) >= 515 ? "LLL dd, y" : "LLL dd";

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full overflow-hidden justify-start text-left font-normal ",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, formatDateString)} -{" "}
                  {format(date.to, formatDateString)}
                </>
              ) : (
                format(date.from, formatDateString)
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 z-[9999]"
          align="start"
          data-side="bottom"
        >
          <Calendar
            initialFocus
            defaultMonth={date?.from}
            numberOfMonths={(windowSize.width ?? 0) >= 644 ? 2 : 1}
            {...props}
            mode="range"
            selected={date}
            onSelect={(range, ...args) => {
              setDate(range);
              onSelect?.(range, ...args);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
