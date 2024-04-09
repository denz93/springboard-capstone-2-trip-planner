"use client";

import TimePicker from "@/components/ui/time-picker";
import PlaceSearch from "./place-search";
import {
  RouterInputs,
  RouterOutputs,
  trpc
} from "@/app/api/trpc/[trpc]/client";
import { addDays, format } from "date-fns";
import { z } from "zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { InsertItineraryStopSchema } from "@/server/db/schema";
import { useState } from "react";
import { FaStar } from "react-icons/fa6";
import { formatKNumber } from "@/app/helpers/format-k-number";
import { priceLevelBadge } from "./helpers";
import { Disappear } from "@/app/components/disappear";

type Trip = NonNullable<RouterOutputs["trip"]["getTripWithItinerary"]>;

type AddStopInput = RouterInputs["itinerary"]["addStop"]["stop"];

export default function AddItineraryStop({
  initialTrip
}: {
  initialTrip: Trip;
}) {
  const { data: trip } = trpc.trip.getTripWithItinerary.useQuery(
    {
      id: initialTrip.id
    },
    {
      initialData: initialTrip
    }
  );
  const {
    control,
    register,
    setValue,
    getValues,
    handleSubmit,
    setError,
    reset,
    formState: { errors }
  } = useForm<AddStopInput>({
    resolver: zodResolver(
      InsertItineraryStopSchema.refine((args) => args.ordinalDay >= 1, {
        message: "Please select a day",
        path: ["ordinalDay"]
      })
    )
  });
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);

  const {
    mutate: createPlace,
    data: place,
    isSuccess: isCreatePlaceSuccess,
    error: createPlaceError
  } = trpc.place.createOrUpdate.useMutation({
    onSuccess: (data) => {
      if (!data) return;
      setValue("placeId", data.id, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true
      });
    }
  });
  const utils = trpc.useUtils();
  const {
    mutate: addStop,
    isPending: isAddStopPending,
    isSuccess: isAddStopSuccess,
    error: addStopError
  } = trpc.itinerary.addStop.useMutation({
    onSuccess: (data) => {
      reset();
      setSelectedPlace(null);

      utils.trip.getTripWithItinerary.invalidate({ id: trip?.id });
      utils.itinerary.findOneWithRelation.invalidate({
        id: trip?.itinerary?.id
      });
    }
  });

  const submitHandler: SubmitHandler<AddStopInput> = (data) => {
    if (!trip?.itinerary) return;
    if (!place) {
      setError("placeId", { message: "Please select a place" });
      return;
    }
    addStop({ id: trip.itinerary.id, stop: { ...data, placeId: place.id } });
  };

  return (
    <form
      className="grid grid-cols-2 gap-6"
      onSubmit={handleSubmit(submitHandler)}
    >
      <div
        className={
          "col-span-2 mx-auto w-full flex justify-center" +
          `${errors.placeId ? "tooltip tooltip-error  tooltip-open tooltip-top" : ""}`
        }
        data-tip={errors.placeId?.message}
      >
        <div className="join join-horizontal w-full md:w-3/4">
          <div className="btn btn-neutral join-item">Find Place</div>
          <div className="join-item w-full *:w-full">
            <PlaceSearch
              baseLocation={trip?.itinerary?.place ?? { lat: 0, lng: 0 }}
              onSelectedPlace={(placeResult) => {
                createPlace({
                  name: placeResult.name ?? "",
                  address: placeResult.vicinity ?? "",
                  lat: placeResult.geometry?.location?.lat() ?? 0,
                  lng: placeResult.geometry?.location?.lng() ?? 0,
                  provider: "google",
                  providerPlaceId: placeResult.place_id ?? ""
                });

                setSelectedPlace(placeResult);

                getValues("name").length === 0 &&
                  setValue("name", placeResult.name ?? "");
              }}
            />
          </div>
        </div>
      </div>

      {selectedPlace && (
        <div className="col-span-2 ">
          <div className="min-w-80 w-8/12 grid grid-cols-5 mx-auto">
            <div className="col-span-2 max-h-32  h-full w-full">
              <img
                className="object-cover w-full h-full"
                src={selectedPlace?.photos?.[0]?.getUrl()}
                alt={selectedPlace.name}
              />
            </div>
            <div className="col-span-3 pl-4 flex flex-col justify-start gap-1 items-start">
              <h2 className="line-clamp-2 m-0">{selectedPlace.name}</h2>
              <p className="text-md italic font-light">
                {selectedPlace.vicinity}
              </p>
              {selectedPlace.rating && (
                <div className="flex w-full py-1 items-center font-mono">
                  <p className="text-sm font-light flex gap-1 items-center badge badge-primary">
                    {selectedPlace.rating}
                    <FaStar />
                    {selectedPlace.user_ratings_total && (
                      <p>
                        {formatKNumber(selectedPlace.user_ratings_total)}{" "}
                        Ratings
                      </p>
                    )}
                  </p>

                  {selectedPlace.price_level && (
                    <div className="mx-auto">
                      {priceLevelBadge(selectedPlace.price_level)}
                    </div>
                  )}
                </div>
              )}
              {selectedPlace.types && (
                <div className="flex flex-wrap gap-[.125em]">
                  {selectedPlace.types.map((t) => (
                    <div className="badge badge-neutral uppercase text-[10px] font-bold">
                      {t.replaceAll("_", " ")}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div
        className={
          "flex flex-col " +
          (errors.startTime
            ? "tooltip tooltip-error  tooltip-open tooltip-top"
            : "")
        }
        data-tip={errors.startTime?.message}
      >
        <div className="join join-horizontal w-full">
          <div className="btn btn-neutral join-item">Start time</div>
          <TimePicker
            className="join-item w-full"
            time={getValues("startTime")}
            onTimeChange={(_, time24hString) => {
              setValue("startTime", time24hString ?? "", {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            }}
          />
        </div>
      </div>

      <div
        className={
          "flex flex-col " +
          (errors.endTime
            ? "tooltip tooltip-error  tooltip-open tooltip-top"
            : "")
        }
        data-tip={errors.endTime?.message}
      >
        <div className="join join-horizontal w-full">
          <div className="btn btn-neutral join-item">End time</div>
          <TimePicker
            className="join-item w-full"
            time={getValues("endTime")}
            onTimeChange={(time, time24hString) => {
              console.log({ time, time24hString });
              setValue("endTime", time24hString ?? "", {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true
              });
            }}
          />
        </div>
      </div>

      <div className="join join-horizontal w-full">
        <div className="btn btn-neutral join-item">Name</div>
        <input
          className="input input-bordered join-item w-full"
          placeholder="Ex: Fill gas tank"
          {...register("name")}
        />
      </div>

      <div
        className={
          " w-full " +
          (errors.ordinalDay
            ? "tooltip tooltip-error  tooltip-open tooltip-top"
            : "")
        }
        data-tip={errors.ordinalDay?.message}
      >
        <div className={"join join-horizontal w-full "}>
          <div className="btn btn-neutral join-item">Day</div>
          <select
            className="select select-bordered w-full join-item"
            {...register("ordinalDay", {
              valueAsNumber: true,
              required: true,
              min: 1,
              max: trip?.itinerary?.days ?? 0
            })}
          >
            <option disabled selected value={-1}>
              What day this stop belong?
            </option>
            {trip?.itinerary &&
              new Array(trip.itinerary.days).fill(0).map((_, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  Day {idx + 1}{" "}
                  {trip.startDate &&
                    format(addDays(trip.startDate, idx), "(EEEE MMM/dd)")}
                </option>
              ))}
          </select>
        </div>
      </div>

      <div className="col-span-2 flex flex-end justify-end items-center">
        <div className="mr-auto flex-gap-1">
          {createPlaceError && (
            <p className="alert alert-error">{createPlaceError.message}</p>
          )}
          {addStopError && (
            <p className="alert alert-error">{addStopError.message}</p>
          )}
          {isAddStopSuccess && (
            <Disappear timeout={5000}>
              <p className="alert alert-success">A stop has been added!</p>
            </Disappear>
          )}
        </div>
        <button
          type="submit"
          disabled={isAddStopPending}
          className="btn btn-bordered"
        >
          Add stop
        </button>
      </div>
    </form>
  );
}
