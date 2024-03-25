"use client";

import { trpc } from "@/app/api/trpc/[trpc]/client";
import type { RouterOutputs, RouterInputs } from "@/app/api/trpc/[trpc]/client";
import TripCard from "@/app/trips/trip-card";
import Link from "next/link";
type TripListType = RouterOutputs["trip"]["getUserTrips"];

export default function TripList({
  initialTrips,
  userId,
}: {
  initialTrips: TripListType;
  userId: RouterInputs["trip"]["getUserTrips"]["userId"];
}) {
  const { data } = trpc.trip.getUserTrips.useQuery(
    { userId },
    {
      initialData: initialTrips,
    }
  );

  if (data.length === 0) {
    return <p className="text-center">No trips</p>;
  }

  return (
    <ul className="list-none flex flex-wrap gap-4">
      {data.length === 0 && <li className="text-center">No trips</li>}
      {data.map((trip) => (
        <li key={trip.id}>
          <Link href={`/trips/${trip.id}`} className="no-underline">
            <TripCard trip={trip} />
          </Link>
        </li>
      ))}
    </ul>
  );
}
