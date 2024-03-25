"use client";

import { RouterOutputs, trpc } from "@/app/api/trpc/[trpc]/client";
import ItineraryText from "@/app/trips/[id]/itinerary-text";

type TripType = NonNullable<RouterOutputs["trip"]["getTripWithItinerary"]>;
type TripId = TripType["id"];
export default function TripDetail({
  initialTrip,
  tripId,
}: {
  initialTrip: TripType;
  tripId: TripId;
}) {
  const { data: trip } = trpc.trip.getTripWithItinerary.useQuery(
    { id: tripId },
    { initialData: initialTrip }
  );
  if (!trip) return <div>Loading</div>;
  if (!trip.itinerary) return <div>No itinerary</div>;
  return (
    <div className=" grid grid-cols-2">
      <div>
        <ItineraryText itinerary={trip.itinerary} />
      </div>

      <div>col2</div>
    </div>
  );
}
