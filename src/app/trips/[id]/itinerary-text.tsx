import { RouterOutputs } from "@/app/api/trpc/[trpc]/client";
import { time } from "console";
import { FaRegCircle as EmptyCircleIcon } from "react-icons/fa6";
type ItineraryType = NonNullable<
  RouterOutputs["trip"]["getTripWithItinerary"]
>["itinerary"];
export default function ItineraryText({
  itinerary,
}: {
  itinerary: NonNullable<ItineraryType>;
}) {
  const withoutSecondTime = (time: string) => {
    return time.split(":")[0] + ":" + time.split(":")[1];
  };
  return (
    <div className="flex flex-col gap-4 items-center">
      <ul className="timeline timeline-horizontal">
        {itinerary.days > 0 &&
          Array(itinerary.days)
            .fill(0)
            .map((_, i) => (
              <li key={i}>
                {i > 0 && <hr />}
                <div className="timeline-start w-36 text-center">
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
          Array(itinerary.days)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex flex-col gap-2 w-full">
                <div
                  className="divider divider-neutral w-full"
                  draggable={true}
                >
                  Day {i + 1}
                </div>
                {itinerary.stops
                  .filter((s) => s.ordinalDay === i + 1)
                  .map((stop, stopIdx) => (
                    <div
                      key={stop.id}
                      className="flex gap-2 items-center"
                      draggable={true}
                    >
                      <h3 className="text-lg justify-start">
                        {i + 1 + stopIdx}. {stop.name}
                      </h3>
                      <div className="badge badge-neutral ml-auto">
                        {withoutSecondTime(stop.startTime)}-
                        {withoutSecondTime(stop.endTime)}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
      </div>
    </div>
  );
}
