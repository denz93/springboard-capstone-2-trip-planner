"use client";
import { RouterOutputs, trpc } from "@/app/api/trpc/[trpc]/client";
import RainbowText from "@/app/components/ranbow-text";
import { sortBy } from "@/app/helpers/sort";
import _ from "lodash";
import { useMemo, useState } from "react";
import { FaRegCircle as EmptyCircleIcon, FaTrash } from "react-icons/fa6";
import { isActiveStop } from "../trip-status-helper";
type ItineraryType = NonNullable<
  RouterOutputs["trip"]["getTripWithItinerary"]
>["itinerary"];
type Stop<T = ItineraryType> = T extends { stops: (infer S)[] }
  ? NonNullable<S>
  : never;

export default function ItineraryText({
  itinerary: initialItinerary,
  highlightStop,
  tripStartDate
}: {
  itinerary: NonNullable<ItineraryType>;
  highlightStop?: Stop;
  tripStartDate?: Date | null;
}) {
  const [itinerary, itineraryQuery] =
    trpc.itinerary.findOneWithRelation.useSuspenseQuery(
      {
        id: initialItinerary.id
      },
      {
        initialData: initialItinerary
      }
    );
  const withoutSecondTime = (time: string) => {
    return time.split(":")[0] + ":" + time.split(":")[1];
  };
  const sortedStops = useMemo(() => {
    return sortBy(itinerary.stops ?? [])
      .by("ordinalDay")
      .by("startTime")
      .by("endTime")
      .result();
  }, [itinerary.stops]);
  const stopGroups = useMemo(
    () => _.groupBy(sortedStops, "ordinalDay"),
    [sortedStops]
  );
  const [editMode, setEditMode] = useState(false);
  const utils = trpc.useUtils();
  const {
    isPending: isRemoveStopPending,
    variables,
    mutate: removeStop
  } = trpc.itinerary.removeStop.useMutation({
    onSuccess: (_, variables) => {
      utils.itinerary.findOneWithRelation.invalidate({
        id: itinerary.id
      });
    }
  });

  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <div className="self-end flex justify-end">
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text mr-4">
              {editMode ? "Edit Mode" : "View Mode"}
            </span>
            <input
              type="checkbox"
              className="toggle"
              checked={editMode}
              onChange={(e) => {
                setEditMode(e.target.checked);
              }}
            />
          </label>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        {itinerary.days > 0 &&
          _.map(stopGroups, (stops, ordinalDay) => (
            <div
              key={ordinalDay}
              className="flex flex-col gap-2 w-full scroll-smooth"
              id={`day_${ordinalDay}`}
            >
              <div className="divider divider-neutral w-full font-extrabold font-mono text-xl">
                {(!highlightStop ||
                  highlightStop.ordinalDay !== +ordinalDay) && (
                  <div className="block min-w-20 text-center">
                    Day {ordinalDay}
                  </div>
                )}
                {highlightStop && +ordinalDay === highlightStop.ordinalDay && (
                  <RainbowText className="min-w-20 text-center">
                    Day {ordinalDay}
                  </RainbowText>
                )}
              </div>
              <>
                {stops.map((stop, stopIdx) => (
                  <div
                    key={stop.id}
                    className={
                      "flex gap-2 items-center py-2 px-4 " +
                      ` ${stop === highlightStop ? "rounded-xl outline-1 outline-dashed outline-slate-400 animate-[pulse_300ms_ease-in_infinite]" : ""}` +
                      (isRemoveStopPending && stop.id === variables?.stopId
                        ? " animate-pulse opacity-20"
                        : "")
                    }
                  >
                    <h3 className="text-lg justify-start">
                      {stopIdx + 1}. {stop.name}
                    </h3>
                    <div
                      className={
                        "badge badge-neutral ml-auto flex-shrink-0 font-mono relative " +
                        `${tripStartDate && isActiveStop(tripStartDate, stop.ordinalDay, stop.startTime, stop.endTime) ? "badge-primary animate-pulse" : ""}`
                      }
                    >
                      <span>
                        {withoutSecondTime(stop.startTime)}-
                        {withoutSecondTime(stop.endTime)}
                      </span>
                      {tripStartDate &&
                        isActiveStop(
                          tripStartDate,
                          stop.ordinalDay,
                          stop.startTime,
                          stop.endTime
                        ) && (
                          <div className="badge badge-accent absolute -top-5 -right-5 after:content-[''] after:rounded-full after:inset-0 after:absolute after:bg-accent after:blur-md after:animate-ping">
                            Now
                          </div>
                        )}
                    </div>

                    {editMode && (
                      <div>
                        <FaTrash
                          className={
                            "animate-bounce duration-700 cursor-pointer " +
                            (isRemoveStopPending
                              ? " pointer-events-none opacity-30"
                              : "")
                          }
                          onClick={() =>
                            removeStop({ id: itinerary.id, stopId: stop.id })
                          }
                        />
                      </div>
                    )}
                  </div>
                ))}
              </>
            </div>
          ))}
      </div>
    </div>
  );
}
