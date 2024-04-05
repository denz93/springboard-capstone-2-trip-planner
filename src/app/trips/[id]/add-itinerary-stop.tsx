"use client";

import TimePicker from "@/components/ui/time-picker";
import PlaceSearch from "./place-search";
import "rc-time-picker/assets/index.css";
import { RouterOutputs } from "@/app/api/trpc/[trpc]/client";
import { addDays, format } from "date-fns";
import { z } from "zod";
type Trip = NonNullable<RouterOutputs["trip"]["getTripWithItinerary"]>;

const addStopSchema = z.object({
  placeId3rdParty: z.string(),
  startTime: z.string().regex(/[0-9]{2}:[0:9]{2}/gi, "Time should match ##:##"),
  endTime: z.string().regex(/[0-9]{2}:[0:9]{2}/gi, "Time should match ##:##"),
  name: z.string().optional(),
  ordi,
});
export default function AddItineraryStop({ trip }: { trip: Trip }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="col-span-2 mx-auto join join-horizontal">
        <div className="btn btn-neutral join-item">Find Place</div>
        <div className="join-item">
          <PlaceSearch
            baseLocation={trip.itinerary?.place ?? { lat: 0, lng: 0 }}
          />
        </div>
      </div>
      <div className="join join-horizontal w-full">
        <div className="btn btn-neutral join-item">Start time</div>
        <TimePicker className="join-item w-full" />
      </div>
      <div className="join join-horizontal w-full">
        <div className="btn btn-neutral join-item">End time</div>
        <TimePicker className="join-item w-full" />
      </div>

      <div className="join join-horizontal w-full">
        <div className="btn btn-neutral join-item">Name</div>
        <input
          className="input input-bordered join-item w-full"
          placeholder="Ex: Fill gas tank"
        />
      </div>

      <div className="join join-horizontal w-full">
        <div className="btn btn-neutral join-item">Day</div>
        <select className="select select-bordered w-full join-item">
          <option disabled selected value={0}>
            What day this stop belong?
          </option>
          {trip.itinerary &&
            new Array(trip.itinerary.days).fill(0).map((_, idx) => (
              <option key={idx + 1} value={idx + 1}>
                Day {idx + 1}{" "}
                {trip.startDate &&
                  format(addDays(trip.startDate, idx), "(EEEE MMM/dd)")}
              </option>
            ))}
        </select>
      </div>

      <div className="col-span-2 flex flex-end justify-end">
        <button className="btn btn-bordered">Add stop</button>
      </div>
    </div>
  );
}
