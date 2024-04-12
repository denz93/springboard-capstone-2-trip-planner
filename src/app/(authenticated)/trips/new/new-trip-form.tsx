"use client";

import { RouterInputs, trpc } from "@/app/api/trpc/[trpc]/client";
import { InsertTripSchema } from "@/server/db/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import PlaceSearch from "../[id]/place-search";
import { useLocation } from "@/app/components/google-map/hooks";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import { addDays, differenceInCalendarDays, startOfDay } from "date-fns";
import { FaPeopleGroup } from "react-icons/fa6";
import { InsertTripAndItinerarySchema } from "@/server/modules/trip/trip.schema";
import { useState } from "react";
type CreateTripInput = RouterInputs["trip"]["createWithItinerary"];

export default function NewTripForm() {
  const {
    handleSubmit,
    formState: { errors },
    setValue,
    register
  } = useForm<CreateTripInput>({
    resolver: zodResolver(InsertTripAndItinerarySchema)
  });

  const submitHanlder: SubmitHandler<CreateTripInput> = (data) => {
    createTrip(data);
  };

  const { mutate: createPlace, isPending: isCreatePlacePending } =
    trpc.place.createOrUpdate.useMutation({
      onSuccess: (place) => {
        if (!place) return;
        setValue("placeId", place.id, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true
        });
      }
    });

  const {
    mutate: createTrip,
    isPending: isCreateTripPending,
    isSuccess: isCreateTripSuccess,
    isError: isCreateTripError,
    error: createTripError
  } = trpc.trip.createWithItinerary.useMutation({});

  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  return (
    <form
      className="grid grid-cols-2 gap-4"
      onSubmit={handleSubmit(submitHanlder)}
    >
      <div
        className={
          " w-full " +
          (errors.name ? " tooltip tooltip-open tooltip-error " : "")
        }
        data-tip={errors.name?.message}
      >
        <div className={"join w-full"}>
          <label className="btn btn-neutral join-item" htmlFor="trip-name">
            Name
          </label>
          <input
            id="trip-name"
            type="text"
            className={"input input-bordered join-item w-full "}
            placeholder="Ex: My Trip to Japan"
            {...register("name")}
          />
        </div>
      </div>

      <div
        data-tip={errors.placeId?.message}
        className={errors.placeId ? " tooltip tooltip-open tooltip-error" : ""}
      >
        <div className={"join w-full relative"}>
          <label className="btn btn-neutral join-item" htmlFor="place">
            Where
          </label>
          <PlaceSearch
            onSelectedPlace={(placeResult) => {
              setSelectedPlace(placeResult);
              createPlace({
                name: placeResult.name ?? "",
                address: placeResult.vicinity ?? "",
                lat: placeResult.geometry?.location?.lat() ?? 0,
                lng: placeResult.geometry?.location?.lng() ?? 0,
                provider: "google",
                providerPlaceId: placeResult.place_id ?? ""
              });
            }}
          />
          {selectedPlace && (
            <div className="absolute top-0 right-0 btn  w-24 btn-neutral outline outline-gray-600 outline-1 -outline-offset-1">
              {selectedPlace.name}
            </div>
          )}
        </div>
      </div>
      <label
        className={
          "form-control " + (errors.description ? "tooltip tooltip-open" : "")
        }
        data-tip={errors.description?.message}
      >
        <div className="label">
          <span className="label-text">Description</span>
        </div>
        <textarea
          className="textarea textarea-bordered textarea-md"
          rows={4}
          placeholder="Ex: Enjoy a full week with my family"
          {...register("description")}
        ></textarea>
      </label>

      <div className="grid grid-col-1 gap-4">
        <label className={"form-control "}>
          <div className="label">
            <span className="label-text">
              Group Size <FaPeopleGroup className="inline-block" />
            </span>
            {errors.groupSize && (
              <span
                className="label-text-alt tooltip tooltip-open tooltip-error tooltip-left"
                data-tip={errors.groupSize.message}
              ></span>
            )}
          </div>
          <input
            type="number"
            className="input input-bordered"
            defaultValue={1}
            {...register("groupSize", { valueAsNumber: true, min: 1 })}
          />
        </label>
        <div className="form-control w-1/2">
          <label className="label cursor-pointer">
            <span className="label-text">With children</span>
            <input
              type="checkbox"
              className="checkbox"
              {...register("hasChildren")}
            />
          </label>
        </div>
      </div>

      <div
        data-tip={
          errors.endDate
            ? errors.endDate.message
            : errors.startDate
              ? errors.startDate.message
              : ""
        }
        className={
          "w-full " +
          (errors.endDate || errors.startDate
            ? " tooltip tooltip-open tooltip-error"
            : "")
        }
      >
        <div className={"join flex"}>
          <div className="btn btn-default join-item">Travel Date</div>
          <DatePickerWithRange
            className="join-item *:h-full w-full *:w-full"
            defaultMonth={new Date()}
            disabled={{ before: new Date() }}
            onSelect={(range) => {
              if (!range) return;
              if (range.from) {
                setValue("startDate", startOfDay(range.from));
              }
              if (range.to) {
                setValue("endDate", startOfDay(range.to));
              }
            }}
          />
        </div>
      </div>

      <div className="divider divide-x col-start-1 col-span-2"></div>
      <div className="col-start-1 col-span-2 flex justify-end items-center">
        {isCreateTripSuccess && (
          <div className="alert alert-success shadow-lg">
            Your trip has been created!
          </div>
        )}
        {isCreateTripError && (
          <div className="alert alert-error shadow-lg">
            {createTripError.message}
          </div>
        )}

        <button className="btn btn-neutral" disabled={isCreatePlacePending}>
          Create{" "}
          {isCreateTripPending ? (
            <span className="loading loading-bars loading-xs"></span>
          ) : (
            ""
          )}
        </button>
      </div>
    </form>
  );
}
