"use client";
import { trpc } from "@/app/api/trpc/[trpc]/client";
import { getUser } from "@/app/helpers/server/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import RainbowText from "./components/ranbow-text";
export default function Navbar({
  initialUser
}: {
  initialUser: Awaited<ReturnType<typeof getUser>> | null;
}) {
  const {
    data: { me: user }
  } = trpc.auth.me.useQuery(undefined, {
    initialData: { me: initialUser }
  });
  const isLogin = !!user;
  const router = useRouter();
  const utils = trpc.useUtils();
  const { mutate } = trpc.auth.logout.useMutation({
    onSuccess: () => {
      utils.auth.me.setData(undefined, () => ({ me: null }));
      router.replace("/");
    }
  });
  const pathName = usePathname();
  const isActive = (path: string) => pathName === path;
  const displayName = user?.name
    ? user.name.substring(0, 2)
    : user?.email.substring(0, 2);
  return (
    <nav className="navbar bg-base-100/60 backdrop-blur-lg z-20 w-full">
      <div className="flex-1">
        <Link
          href={"/"}
          className="btn btn-ghost text-3xl font-bold tracking-tight text-slate-200"
        >
          <RainbowText>Trip Planner</RainbowText>
        </Link>
      </div>
      <div className="ml-auto flex gap-4 items-center">
        {isLogin && (
          <>
            <Link
              className={
                "btn btn-ghost " + (isActive("/trips/new") ? "btn-active" : "")
              }
              href={"/trips/new"}
            >
              <FaPlus />
              New Trip
            </Link>

            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-circle btn-outline"
              >
                <div className="w-10 rounded-full">
                  {displayName?.toUpperCase()}
                </div>
              </div>
              <ul className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-52 border border-slate-600">
                <li>
                  <Link
                    className={
                      "btn btn-ghost " +
                      (isActive("/trips") ? "btn-active" : "")
                    }
                    href={"/trips"}
                  >
                    My Trips
                  </Link>
                </li>
                <li>
                  <Link
                    className={
                      "btn btn-ghost " +
                      (isActive("/profile") ? "btn-active" : "")
                    }
                    href={"/profile"}
                  >
                    Profile
                  </Link>
                </li>
                <li>
                  <Link
                    className="btn btn-ghost"
                    href={"/"}
                    onClick={(e) => {
                      mutate();
                    }}
                  >
                    Logout
                  </Link>
                </li>
              </ul>
            </div>
          </>
        )}

        {!isLogin && (
          <>
            <Link className="btn btn-ghost" href={"/login"}>
              Login
            </Link>
            <Link className="btn btn-ghost" href={"/register"}>
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
