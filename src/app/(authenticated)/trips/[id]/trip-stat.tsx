"use client";

import { RouterOutputs, trpc } from "@/app/api/trpc/[trpc]/client";
import {
  differenceInCalendarDays,
  format,
  addDays,
  addBusinessDays
} from "date-fns";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoIosToday } from "react-icons/io";
import { IoPersonSharp } from "react-icons/io5";
import { TbMoodKid } from "react-icons/tb";
import { formatDistanceToNow } from "date-fns";
import { getStatusBadge } from "../trip-status-helper";

type Trip = NonNullable<RouterOutputs["trip"]["getTrip"]>;

export default function TripStat({ initialTrip }: { initialTrip: Trip }) {
  const { data: trip } = trpc.trip.getTrip.useQuery(
    { id: initialTrip?.id },
    { initialData: initialTrip }
  );

  if (!trip) {
    return <div></div>;
  }

  return (
    <div className="stats stats-vertical 4xl:stats-horizontal ">
      {trip.hasChildren && (
        <div className="stat place-items-center lg:px-10 gap-y-2">
          <div className="stat-title text-2xl ">
            <TbMoodKid />
          </div>
          <div className="stat-value  text-2xl">Yes</div>
          <div className="stat-desc font-extrabold">Kiddo ?</div>
        </div>
      )}

      <div className="stat place-items-center lg:px-10 gap-y-2">
        <div className="stat-title text-2xl ">
          {(trip.groupSize ?? 0) <= 1 && <IoPersonSharp />}
          {(trip.groupSize ?? 0) >= 2 && <FaPeopleGroup />}
        </div>
        <div className="stat-value  text-2xl">{trip.groupSize}</div>
        <div className="stat-desc font-extrabold">Group Size</div>
      </div>

      <div className="stat place-items-center lg:px-10 gap-y-4">
        <div className="stat-title text-2xl">
          <FaRegCalendarAlt />
        </div>
        <div className="stat-value text-2xl">
          {trip.startDate && format(trip.startDate, "MMM do")}
          <span> - </span>
          {trip.endDate && format(trip.endDate, "MMM do")}
        </div>
        <div className="stat-desc font-extrabold">Calendar</div>
      </div>

      <div className="stat place-items-center lg:px-10 gap-y-2">
        <div className="stat-title text-2xl">
          <IoIosToday />
        </div>
        <div className="stat-value  text-2xl">
          {trip.startDate &&
            trip.endDate &&
            differenceInCalendarDays(addDays(trip.endDate, 1), trip.startDate) +
              " days"}
        </div>
        <div className="stat-desc font-extrabold">Length</div>
      </div>

      <div className="stat place-items-center lg:px-10 gap-y-4">
        <div className="stat-title">
          <div className="w-3 h-3 rounded-full bg-current outline outline-1 outline-offset-4 animate-ping"></div>
        </div>
        <div className="stat-value text-2xl text-center">
          {getStatusBadge(trip.startDate, trip.endDate)}
          {trip.startDate && trip.startDate > new Date() && (
            <div>in {formatDistanceToNow(trip.startDate)}</div>
          )}
        </div>
        <div className="stat-desc font-extrabold">Status</div>
      </div>
    </div>
  );
}
