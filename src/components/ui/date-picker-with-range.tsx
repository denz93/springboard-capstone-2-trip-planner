"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange, DayPickerRangeProps } from "react-day-picker/dist";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarProps } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

export function DatePickerWithRange({
  className,
  initialRange,
  onSelect,
  ...props
}: Omit<DayPickerRangeProps, "mode" | "selected"> & {
  initialRange?: DateRange;
}) {
  const [date, setDate] = React.useState<DateRange | undefined>(initialRange);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
          <Calendar
            initialFocus
            defaultMonth={date?.from}
            numberOfMonths={2}
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
