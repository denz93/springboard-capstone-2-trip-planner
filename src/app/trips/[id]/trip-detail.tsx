"use client";

import { RouterOutputs, trpc } from "@/app/api/trpc/[trpc]/client";
import GoogleMapUI from "@/app/components/google-map/ui";
import ItineraryText from "@/app/trips/[id]/itinerary-text";
import ItineraryMap from "./itinerary-map";
import { useState } from "react";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoPersonSharp } from "react-icons/io5";
import { FaRegCalendarAlt } from "react-icons/fa";
import { IoIosToday } from "react-icons/io";

import { format, differenceInDays } from "date-fns";
import { getStatusBadge } from "../trip-status-helper";

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
  const [highlightStop, setHighlightStop] = useState<any>(null)
  if (!trip) return <div>Loading</div>;
  if (!trip.itinerary) return <div>No itinerary</div>;
  return (
    <div className="grid grid-cols-2 gap-4">

      <div className="row-start-3 col-start-1 col-span-2 lg:col-start-1 lg:col-span-1 lg:row-start-2">
        <ItineraryText itinerary={trip.itinerary} highlightStop={highlightStop} tripStartDate={trip.startDate} />
      </div>

      <div className="row-start-2 col-start-1 col-span-2 md:  lg:col-start-2 lg:col:span-1 "><ItineraryMap itinerary={trip.itinerary} onSelectedStop={(s) => setHighlightStop(s)} /></div>
    </div>
  );
}
