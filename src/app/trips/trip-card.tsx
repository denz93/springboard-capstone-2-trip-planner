"use client";
import { RouterOutputs } from "@/app/api/trpc/[trpc]/client";
import { useCallback, useEffect, useState } from "react";
import { format, differenceInDays } from "date-fns";
import { FaPeopleLine as PeopleIcon } from "react-icons/fa6";
import { MdEmojiPeople as PersonIcon } from "react-icons/md";
import { getStatusBadge } from "./trip-status-helper";
import { useGoogleLibrary } from "../components/google-map/hooks";

type TripType = NonNullable<RouterOutputs["trip"]["getUserTrips"][number]>;
export default function TripCard({ trip }: { trip: TripType }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const PlacesLibrary = useGoogleLibrary("PlacesLibrary")
  useEffect(() => {
    async function fetchPhotos() {
      if (!PlacesLibrary) return
      if (!trip.itinerary) return
      const { Place } = PlacesLibrary
      const place = new Place({ id: trip.itinerary?.place?.providerPlaceId ?? '' })
      const { place: newPlace } = await place.fetchFields({ fields: ['displayName', 'formattedAddress', 'location', 'photos'] })
      if (!newPlace.photos) return
      const photoUrl = newPlace.photos[0].getURI({
        maxWidth: 1200, maxHeight: 800
      })
      setPhotoUrl(photoUrl)
    }
    fetchPhotos()
  }, [trip, PlacesLibrary])
  return (
    <div className="card bg-base-300 shadow-xl h-full">
      <figure className="relative h-72">
        {photoUrl && <img src={photoUrl} className="h-full w-full object-cover" />}
        {!photoUrl && <div className="skeleton h-72 w-72"></div>}
        <div className="absolute w-full h-full bg-slate-950/60"></div>
        <div className="absolute top-0 flex w-full items-center px-4 py-2">
          <div className="place-self-start ">
            {getStatusBadge(trip.startDate, trip.endDate)}
          </div>
          <div className="badge badge-secondary ml-auto">
            {trip.startDate && format(trip.startDate, "MMM-dd").toUpperCase()}
          </div>
        </div>
      </figure>
      <div className="card-body">
        <h2 className="card-title">{trip.name}</h2>
        <p className="line-clamp-2">{trip.description}</p>
        <div className="card-actions">
          {trip.groupSize === 1 && (
            <div className="badge badge-outline">
              <PersonIcon />
              {trip.groupSize}
            </div>
          )}

          {trip.groupSize && trip.groupSize > 1 && (
            <div className="badge badge-outline">
              <PeopleIcon />
              {trip.groupSize}
            </div>
          )}

          {trip.startDate && trip.endDate && (
            <div className="badge badge-outline">
              {differenceInDays(trip.endDate, trip.startDate)} days
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
