"use client";

import { RouterOutputs, trpc } from "@/app/api/trpc/[trpc]/client";
import ItineraryText from "@/app/(authenticated)/trips/[id]/itinerary-text";
import ItineraryMap from "./itinerary-map";
import { useState } from "react";
import Modal from "@/app/components/modal";
import { IoMdAdd } from "react-icons/io";
import AddItineraryStop from "./add-itinerary-stop";
import { FaShare } from "react-icons/fa6";
import ShareItinerary from "./share-itinerary";

type TripType = NonNullable<RouterOutputs["trip"]["getTripWithItinerary"]>;
type TripId = TripType["id"];
export default function ItineraryDetail({
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
    <div className="grid grid-cols-2 gap-4 relative">
      {trip.itinerary.isPublic && (
        <div className="absolute badge badge-accent -top-12 left-1/2 -translate-x-1/2 font-bold">
          Public
        </div>
      )}
      <div className="col-span-2 pb-8">
        <div className="flex justify-center gap-4">
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
          <Modal
            activator={
              <button className="btn btn-neutral rounded-xs">
                <FaShare />
                Share Itinerary
              </button>
            }
          >
            <h1 className="text-center">{trip.itinerary.name ?? trip.name}</h1>
            <ShareItinerary
              itineraryId={trip.itinerary.id}
              isPublicStatus={trip.itinerary.isPublic}
              tripId={trip.id}
            />
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
