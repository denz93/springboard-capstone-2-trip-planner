import { RouterOutputs } from "../api/trpc/[trpc]/client";
import ItineraryCard from "./itinerary-card";

type Itinerary = RouterOutputs["itinerary"]["getPublicItineraries"]["data"][0];
export default function ItineraryCardCarousel({
  initialItineraries
}: {
  initialItineraries: Itinerary[];
}) {
  return (
    <div className="w-full carousel carousel-center p-4 space-x-4 bg-neutral rounded-box">
      {initialItineraries.map((itinerary) => (
        <div key={itinerary.id} className="carousel-item w-96">
          <ItineraryCard itinerary={itinerary} />
        </div>
      ))}
    </div>
  );
}
