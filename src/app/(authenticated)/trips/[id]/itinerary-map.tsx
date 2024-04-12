"use client";

import { RouterOutputs, trpc } from "@/app/api/trpc/[trpc]/client";
import React, { useMemo, useState } from "react";

import { useGoogleMapApiKey } from "@/app/components/google-map/context";
import GoogleMapContainer, {
  GoogleAdvanceMarker,
  GoogleCircleElement
} from "@/app/components/google-map/ui";
import { CiLocationOn } from "react-icons/ci";
import { FaMapMarker } from "react-icons/fa";
import { useGoogleLibrary } from "@/app/components/google-map/hooks";
import { sortBy } from "@/app/helpers/sort";

type ItineraryWithStop = NonNullable<
  NonNullable<RouterOutputs["trip"]["getTripWithItinerary"]>["itinerary"]
>;
type ExtractStop<I> = I extends { stops: (infer S)[] } ? NonNullable<S> : never;
type Stop = ExtractStop<ItineraryWithStop>;

export default function ItineraryMap({
  itinerary: initialItinerary,
  onSelectedStop
}: {
  itinerary: ItineraryWithStop;
  onSelectedStop?: (stop: Stop) => void;
}) {
  const [itinerary, itineraryQuery] =
    trpc.itinerary.findOneWithRelation.useSuspenseQuery(
      { id: initialItinerary.id },
      {
        initialData: initialItinerary
      }
    );
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const GeometryLibrary = useGoogleLibrary("GeometryLibrary");
  const maxDistanceFromCenter = useMemo(() => {
    if (typeof google === "undefined") return 0;
    if (!GeometryLibrary) return 0;
    return itinerary.stops.reduce(
      (max, stop) =>
        Math.max(
          max,
          GeometryLibrary.spherical.computeDistanceBetween(
            itinerary.place as any,
            stop.place as any
          )
        ),
      0
    );
  }, [itinerary.stops, GeometryLibrary]);
  const sortedStops = useMemo(
    () =>
      sortBy(itinerary.stops ?? [])
        .by("ordinalDay")
        .by("startTime")
        .by("endTime")
        .result(),
    [itinerary.stops]
  );
  return (
    <GoogleMapContainer initialLocation={itinerary.place as any}>
      <GoogleCircleElement
        center={itinerary.place}
        radius={maxDistanceFromCenter}
      />
      <>
        {sortedStops.map((s, idx) => (
          <GoogleAdvanceMarker key={s.id} position={s.place as any}>
            <div
              className={
                "text-xl text-base-300 flex items-center justify-center " +
                `${selectedStop && selectedStop.ordinalDay === s.ordinalDay ? "opacity-100" : "opacity-80"}`
              }
              onClick={() => {
                setSelectedStop(s);
                onSelectedStop?.(s);
              }}
            >
              <FaMapMarker
                size={"2rem"}
                title={s.name}
                className={` ${selectedStop === s ? "text-base-300" : selectedStop && selectedStop.ordinalDay === s.ordinalDay ? "text-slate-600" : "text-slate-400"}`}
              />
              <span className="absolute z-10 w-full text-center text-xs text-slate-50 translate-y-[-3px]">
                {idx + 1}
              </span>
            </div>
          </GoogleAdvanceMarker>
        ))}
      </>
    </GoogleMapContainer>
  );
}
