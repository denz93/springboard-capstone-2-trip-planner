import ItineraryCardCarousel from "./itinerary/itinerary-card-carousel";
import * as itineraryService from "@/server/modules/itinerary/itinerary.service";
import Hero from "./assets/hero.jpg";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const itineraries = await itineraryService.findAll(
    { isPublic: true },
    { limit: 5, cursor: 0 }
  );
  return (
    <div className="min-h-screen mb-8">
      <div className="hero min-h-[calc(100svh_-_65px)] relative">
        <Image
          className="object-cover w-full h-full absolute"
          src={Hero}
          alt="trip planner hero"
        />
        <div className="hero-overlay bg-opacity-30 z-0"></div>
        <div className="hero-content text-center text-neutral-content rounded-box bg-base-300/50 backdrop-blur-lg">
          <div className="max-w-xl">
            <h1 className="mb-5 text-5xl font-bold">Trip Planner</h1>
            <p className="mb-5 font-light italic">
              Your all-in-one solution for seamless trip planning and
              personalized exploration.
            </p>
            <Link className="btn btn-neutral" href={"/login"}>
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <h1 className="divider mt-20 mb-12 px-6">Popular Trips</h1>
      <div className="mx-auto px-6">
        <ItineraryCardCarousel initialItineraries={itineraries} />
      </div>
    </div>
  );
}
