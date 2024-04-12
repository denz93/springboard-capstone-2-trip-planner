"use client";

import { RouterOutputs, trpc } from "../api/trpc/[trpc]/client";
import { useAlert } from "../components/alert";
import { usePlaceDetailsQuery } from "../components/google-map/hooks";
import { useRouter } from "next/navigation";
type Itinerary = RouterOutputs["itinerary"]["getPublicItineraries"]["data"][0];

export default function ItineraryCard({ itinerary }: { itinerary: Itinerary }) {
  const {
    data: placeDetails,
    isPending,
    isSuccess
  } = usePlaceDetailsQuery(itinerary.place?.providerPlaceId ?? "");

  const router = useRouter();
  const alertPush = useAlert();
  const { isPending: isCreateTripPending, mutate: createTrip } =
    trpc.trip.createTripFromPublicItinerary.useMutation({
      onSuccess: (data) => {
        alertPush({ message: "Your trip has been created!", type: "success" });
        router.push(`/trips/${data.id}`);
      },
      onError(error) {
        alertPush({ message: error.message, type: "error" });
      }
    });

  return (
    <div className="card bg-base-100">
      <figure className="w-full h-56">
        {isPending && <div className="skeleton w-full h-full"></div>}
        {isSuccess && placeDetails && (
          <img
            src={placeDetails.photos?.[0].getUrl({
              maxWidth: 1200,
              maxHeight: 800
            })}
            className="w-full h-full object-cover"
          />
        )}
      </figure>
      <div className="card-body">
        <div className="card-title">
          {itinerary.name ?? itinerary.place?.name}
        </div>
        {itinerary.description && (
          <p className="clamp-2 italic opacity-50">{itinerary.description}</p>
        )}

        <div className="card-actions justify-end items-center">
          <div className="badge badge-neutral">{itinerary.days} days</div>
          <button
            className="btn btn-ghost"
            disabled={isCreateTripPending}
            onClick={() => createTrip({ itineraryId: itinerary.id })}
          >
            Create my own trip{" "}
            {isCreateTripPending && (
              <span className="loading loading-bars"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
