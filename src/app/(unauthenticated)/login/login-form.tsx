"use client";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { trpc } from "@/app/api/trpc/[trpc]/client";
import { LocalLoginInputSchema } from "@/server/modules/auth/auth.schema";
import { useRouter } from "next/navigation";
export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<z.infer<typeof LocalLoginInputSchema>>({
    resolver: zodResolver(LocalLoginInputSchema)
  });
  const utils = trpc.useUtils();
  const router = useRouter();
  const {
    mutate,
    isPending,
    error: mutationError
  } = trpc.auth.loginLocal.useMutation({
    onSuccess: (data) => {
      utils.auth.me.setData(undefined, () => ({ me: data ?? null }));
      router.replace("/");
    }
  });
  return (
    <form
      className="flex flex-col gap-4 items-start"
      onSubmit={handleSubmit((data) => {
        mutate(data);
      })}
    >
      <div className="flex flex-col gap-1 w-56">
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
      <div className="flex flex-col gap-1 w-56">
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
      <button className="w-full btn btn-ghost" disabled={isPending}>
        Login
      </button>
      {mutationError && <label>{mutationError.message}</label>}
    </form>
  );
}
