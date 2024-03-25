import { randomBackgroundUrl } from "@/app/trips/[id]/random-bg";
import TripDetail from "@/app/trips/[id]/trip-detail";
import * as tripService from "@/server/modules/trip/trip.service";
import Image from "next/image";

export default async function TripPage({ params }: { params: { id: number } }) {
  const trip = await tripService.findOneWithRelation(params.id);
  if (!trip) throw new Error("Trip not found");
  return (
    <div className="">
      <div className="hero h-[calc(100vh_*_.6)] w-full relative">
        <Image
          width={1600}
          height={900}
          className="object-cover absolute w-full h-full z-[-1]"
          src={randomBackgroundUrl()}
          alt={trip.name}
          priority
        />
        <div className="hero-overlay bg-base-300 bg-opacity-50"></div>
        <div className="hero-content text-center text-neutral-content backdrop-blur-md  bg-base-300 bg-opacity-50 rounded-xl">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">{trip.name}</h1>
            <p className="mb-5 line-clamp-6">{trip.description}</p>
          </div>
        </div>
      </div>
      <h2 className="text-center text-3xl font-bold my-4">Itinerary</h2>
      <TripDetail initialTrip={trip} tripId={trip.id} />
    </div>
  );
}
