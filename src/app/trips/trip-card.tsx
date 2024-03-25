"use client";
import { RouterOutputs } from "@/app/api/trpc/[trpc]/client";
import { useCallback } from "react";
import { format, differenceInDays } from "date-fns";
import { FaPeopleLine as PeopleIcon } from "react-icons/fa6";
import { MdEmojiPeople as PersonIcon } from "react-icons/md";

type TripType = NonNullable<RouterOutputs["trip"]["getTrip"]>;
export default function TripCard({ trip }: { trip: TripType }) {
  const getStatusBadge = useCallback((date: Date | null) => {
    if (!date)
      return <div className="badge badge-outline badge-neutral">Planning</div>;
    if (date < new Date())
      <div className="badge badge-outline badge-success">Completed</div>;
    return <div className="badge badge-outline badge-primary">Upcoming</div>;
  }, []);

  return (
    <div className="card w-96 bg-base-300 shadow-xl">
      <figure>
        <img src={""} />
        <div className="absolute top-0 flex w-full items-center px-4 py-2">
          <div className="place-self-start">
            {getStatusBadge(trip.startDate)}
          </div>
          <div className="badge badge-secondary ml-auto">
            {trip.startDate && format(trip.startDate, "MMM-dd").toUpperCase()}
          </div>
        </div>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{trip.name}</h2>
        <p className="line-clamp-2">{trip.description}</p>
        <div className="card-actions">
          {trip.groupSize === 1 && (
            <div className="badge badge-outline">
              <PersonIcon />
              {trip.groupSize}
            </div>
          )}

          {trip.groupSize && trip.groupSize > 1 && (
            <div className="badge badge-outline">
              <PeopleIcon />
              {trip.groupSize}
            </div>
          )}

          {trip.startDate && trip.endDate && (
            <div className="badge badge-outline">
              {differenceInDays(trip.endDate, trip.startDate)} days
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
