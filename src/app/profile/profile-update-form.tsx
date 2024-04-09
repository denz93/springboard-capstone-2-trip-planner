"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { RouterInputs, RouterOutputs, trpc } from "../api/trpc/[trpc]/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateUserSchema } from "@/server/modules/user/user.schema";
import { useAlert } from "../components/alert";

type User = NonNullable<RouterOutputs["auth"]["me"]["me"]>;
type UpdateFormData = RouterInputs["user"]["update"];
export default function ProfileUpdateForm({ user }: { user: User }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid }
  } = useForm<UpdateFormData>({
    resolver: zodResolver(UpdateUserSchema),
    defaultValues: {
      name: user.name ?? undefined
    }
  });
  const { mutate: updateUser, isPending } = trpc.user.update.useMutation({
    onSuccess: () => {
      alertPush({ message: "Profile has been updated!", type: "success" });
    },
    onError: (error) => {
      alertPush({ message: error.message, type: "error" });
    }
  });
  const submitHandler: SubmitHandler<UpdateFormData> = (data) => {
    updateUser(data);
  };
  const alertPush = useAlert();

  return (
    <form
      className="mx-auto grid grid-col-1 md:w-8/12 justify-center gap-2"
      onSubmit={handleSubmit(submitHandler)}
    >
      <div className="join">
        <label className="btn btn-neutral join-item" htmlFor="name">
          Name
        </label>
        <input
          {...register("name")}
          id="name"
          className="input input-bordered join-item w-full"
        />
      </div>
      <div className="join">
        <label className="btn btn-neutral join-item" htmlFor="email">
          Email
        </label>
        <input
          className="input input-bordered join-item w-full"
          readOnly
          disabled
          value={user.email}
        />
      </div>

      <button
        className="btn btn-neutral w-full"
        disabled={!isDirty || !isValid || isPending}
      >
        Update{" "}
        {isPending ? (
          <span className="loading loading-bars loading-sm"></span>
        ) : (
          ""
        )}
      </button>
    </form>
  );
}
