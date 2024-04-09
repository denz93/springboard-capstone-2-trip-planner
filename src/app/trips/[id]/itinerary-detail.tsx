"use client";

import { RouterOutputs, trpc } from "@/app/api/trpc/[trpc]/client";
import ItineraryText from "@/app/trips/[id]/itinerary-text";
import ItineraryMap from "./itinerary-map";
import { useState } from "react";
import Modal from "@/app/components/modal";
import { IoMdAdd } from "react-icons/io";
import AddItineraryStop from "./add-itinerary-stop";

type TripType = NonNullable<RouterOutputs["trip"]["getTripWithItinerary"]>;
type TripId = TripType["id"];
export default function TripDetail({
  initialTrip,
  tripId
}: {
  initialTrip: TripType;
  tripId: TripId;
}) {
  const { data: trip } = trpc.trip.getTripWithItinerary.useQuery(
    { id: tripId },
    { initialData: initialTrip }
  );
  const [highlightStop, setHighlightStop] = useState<any>(null);
  if (!trip) return <div>Loading</div>;
  if (!trip.itinerary) return <div>No itinerary</div>;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 pb-8">
        <div className="flex justify-center">
          <Modal
            activator={
              <button className="btn btn-neutral rounded-xs">
                <IoMdAdd />
                Add New Stop
              </button>
            }
          >
            <h1 className="text-center mt-0">Add New Stop to Your Journey</h1>
            <AddItineraryStop initialTrip={trip} />
          </Modal>
        </div>
      </div>
      <div className="row-start-3 col-start-1 col-span-2 lg:col-start-1 lg:col-span-1 lg:row-start-2">
        <ItineraryText
          itinerary={trip.itinerary}
          highlightStop={highlightStop}
          tripStartDate={trip.startDate}
        />
      </div>

      <div className="row-start-2 col-start-1 col-span-2 md:  lg:col-start-2 lg:col:span-1 ">
        <ItineraryMap
          itinerary={trip.itinerary}
          onSelectedStop={(s) => setHighlightStop(s)}
        />
      </div>
    </div>
  );
}
