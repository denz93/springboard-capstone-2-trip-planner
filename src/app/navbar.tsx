"use client";
import { trpc } from "@/app/api/trpc/[trpc]/client";
import { getUser } from "@/app/helpers/server/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
export default function Navbar({
  initialUser,
}: {
  initialUser: Awaited<ReturnType<typeof getUser>> | null;
}) {
  const {
    data: { me: user },
  } = trpc.auth.me.useQuery(undefined, {
    initialData: { me: initialUser },
  });
  const isLogin = !!user;
  const router = useRouter();
  const utils = trpc.useUtils();
  const { mutate } = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, () => ({ me: null }));
      router.replace("/");
    },
  });

  return (
    <nav className="flex max-w-7xl px-4 py-6 sm:px-6 lg:px-8 items-center">
      <Link
        href={"/"}
        className="text-3xl font-bold tracking-tight text-slate-200"
      >
        Trip Planner
      </Link>
      <div className="ml-auto flex gap-4">
        {isLogin && (
          <>
            <Link className="" href={"/trips"}>
              Trips
            </Link>
            <Link className="" href={"/profile"}>
              Profile
            </Link>
            <Link
              className=""
              href={"/"}
              onClick={(e) => {
                mutate();
              }}
            >
              Logout
            </Link>
          </>
        )}

        {!isLogin && (
          <>
            <Link className="" href={"/login"}>
              Login
            </Link>
            <Link className="" href={"/register"}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
