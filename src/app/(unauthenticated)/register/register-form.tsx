"use client";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LocalRegisterInputSchema } from "@/server/modules/auth/auth.schema";
import { trpc } from "@/app/api/trpc/[trpc]/client";
const LocalRegisterWithConfirmPasswordInputSchema =
  LocalRegisterInputSchema.extend({
    confirmPassword: z.string().min(1)
  }).superRefine((arg, ctx) => {
    if (arg.password !== arg.confirmPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: "custom",
        message: "Password and Confirm Password do not match"
      });
    }
  });
export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof LocalRegisterWithConfirmPasswordInputSchema>>({
    resolver: zodResolver(LocalRegisterWithConfirmPasswordInputSchema)
  });
  const { mutate, isPending } = trpc.auth.registerLocal.useMutation();
  return (
    <form
      className="flex flex-col gap-4 items-start w-80"
      onSubmit={handleSubmit(({ confirmPassword, ...data }) => mutate(data))}
      autoComplete="off"
    >
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="email">Email</label>
        {errors.email && <label htmlFor="email">{errors.email.message}</label>}
        <input
          className="input input-bordered w-full"
          disabled={isPending}
          id="email"
          type="email"
          placeholder="Ex: john69@example.com"
          {...register("email")}
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="name">Name (optional)</label>
        {errors.name && <label htmlFor="name">{errors.name.message}</label>}
        <input
          className="input input-bordered w-full"
          disabled={isPending}
          id="name"
          type="text"
          placeholder="Your name"
          {...register("name")}
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="password">Password</label>
        {errors.password && (
          <label htmlFor="password">{errors.password.message}</label>
        )}
        <input
          className="input input-bordered w-full"
          disabled={isPending}
          id="password"
          type="password"
          placeholder="Your password"
          {...register("password")}
        />
      </div>
      <div className="flex flex-col gap-1 w-full">
        <label htmlFor="confirmPassword">Confirm Password</label>
        {errors.confirmPassword && (
          <label htmlFor="confirmPassword">
            {errors.confirmPassword.message}
          </label>
        )}
        <input
          className="input input-bordered w-full"
          disabled={isPending}
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          {...register("confirmPassword")}
        />
      </div>
      <button className="w-full btn btn-neutral">Register</button>
    </form>
  );
}
