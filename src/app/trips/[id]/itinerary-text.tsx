import { RouterOutputs } from "@/app/api/trpc/[trpc]/client";
import RainbowText from "@/app/components/ranbow-text";
import { sortBy } from "@/app/helpers/sort";
import { time } from "console";
import _ from "lodash";
import { useMemo, useState } from "react";
import { FaRegCircle as EmptyCircleIcon } from "react-icons/fa6";
import { isActiveStop } from "../trip-status-helper";
type ItineraryType = NonNullable<
  RouterOutputs["trip"]["getTripWithItinerary"]
>["itinerary"];
type Stop<T = ItineraryType> = T extends { "stops": (infer S)[] } ? NonNullable<S> : never

export default function ItineraryText({
  itinerary,
  highlightStop,
  tripStartDate
}: {
  itinerary: NonNullable<ItineraryType>;
  highlightStop?: Stop,
  tripStartDate?: Date | null
}) {
  const withoutSecondTime = (time: string) => {
    return time.split(":")[0] + ":" + time.split(":")[1];
  };
  const sortedStops = useMemo(() => sortBy(itinerary.stops ?? []).by("ordinalDay").by("startTime").by("endTime").result(), [itinerary.stops])
  const stopGroups = useMemo(() => _.groupBy(sortedStops, "ordinalDay"), [sortedStops]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  return (
    <div className="flex flex-col gap-4 items-center justify-center">
      <ul className="timeline timeline-horizontal">
        {itinerary.days > 0 &&
          Array(itinerary.days)
            .fill(0)
            .map((_, i) => (
              <li key={i}>
                {i > 0 && <hr />}
                <div className={"timeline-start text-center px-4" + ``}>
                  <a href={`#day_${i + 1}`}>Day {i + 1}</a>
                </div>
                <div className="timeline-middle">
                  <a href={`#day_${i + 1}`}>
                    <EmptyCircleIcon />
                  </a>
                </div>
                {i < itinerary.days - 1 && <hr />}
              </li>
            ))}
      </ul>
      <div className="flex flex-col gap-2 w-full">
        {itinerary.days > 0 &&
          _.map(stopGroups, (stops, ordinalDay) => (
            <div key={ordinalDay} className="flex flex-col gap-2 w-full scroll-smooth" id={`day_${ordinalDay}`} onClick={() => setSelectedDay(+ordinalDay)}>
              <div
                className="divider divider-neutral w-full font-extrabold font-mono text-xl"
              >
                {(!highlightStop || highlightStop.ordinalDay !== +ordinalDay) && <div className="block min-w-20 text-center">Day {ordinalDay}</div>}
                {(highlightStop && +ordinalDay === highlightStop.ordinalDay) && <RainbowText className="min-w-20 text-center">Day {ordinalDay}</RainbowText>}

              </div>
              {stops.map((stop, stopIdx) => (
                <div
                  key={stop.id}
                  className={"flex gap-2 items-center py-2 px-4 " + ` ${stop === highlightStop ? 'rounded-xl outline-1 outline-dashed outline-slate-400 animate-[pulse_300ms_ease-in_infinite]' : ''}`}
                >
                  <h3 className="text-lg justify-start">
                    {stopIdx + 1}. {stop.name}
                  </h3>
                  <div className={"badge badge-neutral ml-auto flex-shrink-0 font-mono relative " + `${(tripStartDate && isActiveStop(tripStartDate, stop.ordinalDay, stop.startTime, stop.endTime)) ? 'badge-primary animate-pulse' : ''}`}>
                    <span>
                      {withoutSecondTime(stop.startTime)}-
                      {withoutSecondTime(stop.endTime)}
                    </span>
                    {(tripStartDate && isActiveStop(tripStartDate, stop.ordinalDay, stop.startTime, stop.endTime)) && <div className="badge badge-accent absolute -top-5 -right-5 after:content-[''] after:rounded-full after:inset-0 after:absolute after:bg-accent after:blur-md after:animate-ping">
                      Now
                    </div>}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
