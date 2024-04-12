"use client";

import { RouterInputs, trpc } from "@/app/api/trpc/[trpc]/client";
import { useAlert } from "@/app/components/alert";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
export default function RemoveTrip({
  id
}: {
  id: RouterInputs["trip"]["remove"]["id"];
}) {
  const utils = trpc.useUtils();
  const router = useRouter();
  const { mutate: removeTrip, isPending } = trpc.trip.remove.useMutation({
    onSuccess() {
      utils.trip.getTrip.invalidate({ id });
      utils.trip.getUserTrips.invalidate();
      router.replace("/trips");
      alertPush({ message: "Trip has been removed!", type: "success" });
    },

    onError(error) {
      alertPush({ message: error.message, type: "error" });
    }
  });

  const alertPush = useAlert();

  return (
    <div className="grid grid-cols-1 items-center justify-center">
      <p className="text-center">Are you sure you want to remove this trip?</p>
      <div className="divider"></div>
      <form method={"dialog"} className="flex justify-end gap-4">
        <button
          className="btn btn-neutral"
          disabled={isPending}
          onClick={() => removeTrip({ id })}
        >
          Yes
        </button>
        <button className="btn btn-neutral btn-outline">No</button>
      </form>
    </div>
  );
}
