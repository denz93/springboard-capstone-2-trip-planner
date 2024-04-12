import { randomBackgroundUrl } from "@/app/(authenticated)/trips/[id]/random-bg";
import ItineraryDetail from "@/app/(authenticated)/trips/[id]/itinerary-detail";
import * as tripService from "@/server/modules/trip/trip.service";
import Image from "next/image";
import { CiEdit } from "react-icons/ci";
import Modal from "@/app/components/modal";
import EditTripForm from "./trip-edit-form";
import TripStat from "./trip-stat";
import { FaShare, FaTrash } from "react-icons/fa6";
import RemoveTrip from "./remove-trip";

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
      <div className="flex justify-center py-8 px-6">
        <TripStat initialTrip={trip} />
      </div>

      <div className="flex gap-4 justify-center">
        <Modal
          activator={
            <button className="btn btn-neutral rounded-xs">
              <CiEdit />
              Edit Trip
            </button>
          }
        >
          <h1 className=" font-bold text-center">Update Your Trip</h1>
          <EditTripForm trip={trip} />
        </Modal>

        <Modal
          activator={
            <button className="btn btn-outline btn-warning rounded-xs">
              <FaTrash />
              Remove Trip
            </button>
          }
        >
          <h1 className="text-center">{trip.name}</h1>
          <RemoveTrip id={trip.id} />
        </Modal>
      </div>

      <h1 className="text-center font-bold my-16 divider relative">
        <div className="relative">
          <span>Itinerary</span>
          {trip.itinerary?.isPublic && (
            <span className="absolute badge badge-accent -right-4 top-0 translate-x-[100%]">
              Public
            </span>
          )}
        </div>
      </h1>

      <ItineraryDetail initialTrip={trip} tripId={trip.id} />
    </div>
  );
}
