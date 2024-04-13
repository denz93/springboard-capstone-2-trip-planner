"use client";

import { trpc } from "@/app/api/trpc/[trpc]/client";
import type { RouterOutputs, RouterInputs } from "@/app/api/trpc/[trpc]/client";
import TripCard from "./trip-card";
import Link from "next/link";
import { sortBy } from "@/app/helpers/sort";
import { differenceInDays } from "date-fns";
type TripListType = RouterOutputs["trip"]["getUserTrips"];

export default function TripList({
  initialTrips,
  userId
}: {
  initialTrips: TripListType;
  userId: RouterInputs["trip"]["getUserTrips"]["userId"];
}) {
  const { data } = trpc.trip.getUserTrips.useQuery(
    { userId },
    {
      initialData: initialTrips,
      select(trips) {
        return sortBy(trips)
          .desc()
          .by((t) => (t.startDate && t.startDate > new Date() ? 1 : -1))
          .asc()
          .by((t) => differenceInDays(t.startDate ?? new Date(), new Date()))
          .result();
      }
    }
  );

  if (data.length === 0) {
    return <p className="text-center">No trips</p>;
  }

  return (
    <ul className="list-none grid grid-cols-1 auto-rows-fr gap-x-6 gap-y-8 2xl:grid-cols-2 5xl:grid-cols-3">
      {data.length === 0 && <li className="text-center">No trips</li>}
      {data.map((trip) => (
        <li key={trip.id}>
          <Link
            href={`/trips/${trip.id}`}
            className="no-underline block h-full"
          >
            <TripCard trip={trip} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
