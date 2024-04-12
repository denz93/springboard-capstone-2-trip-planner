"use client";

import { RouterInputs, trpc } from "@/app/api/trpc/[trpc]/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { UpdateTripSchema } from "@/server/db/schema";
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range";
import useTimer from "@/app/components/use-timer";
type FormInputs = RouterInputs["trip"]["update"];
type Trip = RouterInputs["trip"];

export default function EditTripForm({ trip }: { trip: FormInputs }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, touchedFields },
    setValue,
    trigger,
    reset,
    resetField
  } = useForm<FormInputs>({
    resolver: zodResolver(UpdateTripSchema),
    defaultValues: trip
  });
  const utils = trpc.useUtils();
  const { setTimer, isTiming } = useTimer();
  const {
    mutate,
    isPending,
    error: mutationError,
    isError: isMutationError,
    isSuccess
  } = trpc.trip.update.useMutation({
    onSuccess(data) {
      if (data) {
        utils.trip.getTrip.setData({ id: data.id }, () => data);
        utils.trip.getTripWithItinerary.invalidate({ id: data.id });
      }
      reset(data);
      setTimer(7000);
    }
  });
  const submitHandler: SubmitHandler<FormInputs> = (data) => {
    mutate(data);
  };
  return (
    <form
      className="grid grid-cols-2 gap-y-6 gap-x-4 px-8 "
      onSubmit={handleSubmit(submitHandler, (errors) =>
        console.log({ errors })
      )}
    >
      <div className="join join-horizontal">
        <label className="btn btn-neutral join-item" htmlFor="name">
          Name
        </label>
        <div
          className={
            "w-full " +
            (errors.name
              ? "tooltip tooltip-error  tooltip-open tooltip-top"
              : "")
          }
          data-tip={errors.name?.message}
        >
          <input
            {...register("name")}
            id="name"
            className="input input-bordered join-item w-full"
          />
        </div>
      </div>
      <div className="join join-horizontal">
        <label className="btn btn-neutral join-item" htmlFor="group-size">
          Group Size
        </label>
        <div
          className={
            "w-full " +
            `${errors.groupSize ? "tooltip tooltip-error  tooltip-open tooltip-top" : ""}`
          }
          data-tip={errors.groupSize?.message}
        >
          <input
            type="number"
            {...register("groupSize", { valueAsNumber: true })}
            id="group-size"
            className="input input-bordered join-item w-full"
          />
        </div>
      </div>
      <div className="col-start-1 col-span-2">
        <div className="label">
          <label className="label-text " htmlFor="description">
            Description
          </label>
        </div>
        <div
          className={`${errors.description ? "tooltip tooltip-error  tooltip-open tooltip-top" : ""}`}
          data-tip={errors.description?.message}
        >
          <textarea
            id="description"
            className="textarea textarea-bordered textarea-lg w-full"
            placeholder="Description"
            {...register("description")}
          ></textarea>
        </div>
      </div>

      <div className="join join-horizontal col-start-1 col-span-2">
        <label className="btn btn-neutral join-item" htmlFor="start_date">
          Start Date - End Date
        </label>
        <div
          className={
            "join-item " +
            `${errors.startDate || errors.endDate ? "tooltip tooltip-error  tooltip-open tooltip-top" : ""}`
          }
          data-tip={errors.startDate?.message || errors.endDate?.message}
        >
          <DatePickerWithRange
            className="join-item w-full h-full *:w-full *:h-full *:join-item"
            initialRange={{
              from: trip.startDate ?? undefined,
              to: trip.endDate ?? undefined
            }}
            onSelect={(range) => {
              setValue("startDate", range?.from, {
                shouldDirty: true,
                shouldValidate: true
              });
              setValue("endDate", range?.to, {
                shouldDirty: true,
                shouldTouch: true
              });
            }}
          />
        </div>
      </div>

      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Travel with children ?</span>
          <input
            type="checkbox"
            className="checkbox"
            {...register("hasChildren")}
          />
        </label>
      </div>

      <div className="col-start-1 col-span-2">
        <div className="divider"></div>
        <div className="flex gap-4 justify-end">
          {isTiming && isMutationError && (
            <div role="alert" className="alert alert-error max-w-md mr-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{mutationError.message}</span>
            </div>
          )}
          {isTiming && isSuccess && (
            <div
              role="alert"
              className="alert alert-success max-w-md   mr-auto"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Your trip has been updated!</span>
            </div>
          )}
          <button
            className="btn btn-outline btn-neutral"
            disabled={!isDirty || isPending}
          >
            Update
          </button>
        </div>
      </div>
    </form>
  );
}
