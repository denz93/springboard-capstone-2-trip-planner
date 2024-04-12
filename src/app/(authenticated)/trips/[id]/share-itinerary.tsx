"use client";

import { trpc } from "@/app/api/trpc/[trpc]/client";
import { useAlert } from "@/app/components/alert";

export default function ShareItinerary({
  tripId,
  itineraryId,
  isPublicStatus
}: {
  tripId: number;
  itineraryId: number;
  isPublicStatus: boolean;
}) {
  const alertPush = useAlert();
  const utils = trpc.useUtils();
  const { mutate: updateStatus, isPending } =
    trpc.itinerary.makePublic.useMutation({
      onSuccess: (data) => {
        if (data.isPublic) {
          alertPush({
            message: "Itinerary has been shared as public!",
            type: "success"
          });
        } else {
          alertPush({
            message: "Itinerary has been made private!",
            type: "success"
          });
        }
        utils.trip.getTripWithItinerary.invalidate({ id: tripId });
        utils.itinerary.getPublicItineraries.invalidate();
      },
      onError: (err) => {
        alertPush({ message: err.message, type: "error" });
      }
    });
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {!isPublicStatus && <h3>Are your sure to share your itinerary?</h3>}
      {isPublicStatus && <h3>Are your sure to make your itinerary private?</h3>}
      <form method={"dialog"} className="flex justify-end gap-2">
        <button
          className="btn btn-neutral"
          disabled={isPending}
          onClick={() =>
            updateStatus({ id: itineraryId, isPublic: !isPublicStatus })
          }
        >
          {isPublicStatus ? "Go private" : "Share"}
        </button>
        <button className="btn btn-outline">Cancel</button>
      </form>
    </div>
  );
}
