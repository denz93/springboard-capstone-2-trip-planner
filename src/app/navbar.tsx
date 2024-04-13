"use client";
import { trpc } from "@/app/api/trpc/[trpc]/client";
import { getUser } from "@/app/helpers/server/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaBurger, FaPlus } from "react-icons/fa6";
import { usePathname } from "next/navigation";
import RainbowText from "./components/ranbow-text";
import { CiMenuBurger } from "react-icons/ci";
import { IoClose, IoMenu } from "react-icons/io5";
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
    <nav className="navbar bg-base-100/60 backdrop-blur-lg z-20 w-full @container/nav">
      <div className="">
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
                "@md/nav:flex hidden btn btn-ghost " +
                (isActive("/trips/new") ? "btn-active" : "")
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
          <div className="dropdown dropdown-end xl:flex xl:static">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-circle btn-outline group xl:hidden"
            >
              <IoMenu className="group-focus:opacity-0 group-focus:absolute opacity-100 transition-opacity" />
              <IoClose className="group-focus:opacity-100 group-focus:static opacity-0 absolute transition-opacity" />
            </div>
            <ul className="menu menu-sm dropdown-content mt-3 z-10 p-2 shadow bg-base-100 rounded-box w-52 border border-slate-600 xl:!flex-row xl:!static xl:!visible xl:!opacity-100 xl:!p-0 xl:!m-0 xl:bg-transparent xl:!border-none xl:shadow-none xl:!transform-none xl:w-auto">
              <li className="xl:block">
                <Link
                  className={
                    "btn btn-ghost " + (isActive("/login") ? "btn-active" : "")
                  }
                  href={"/login"}
                >
                  Login
                </Link>
              </li>
              <li className="xl:block">
                <Link
                  className={
                    "btn btn-ghost " +
                    (isActive("/register") ? "btn-active" : "")
                  }
                  href={"/register"}
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      {isLogin && (
        <div className="@md/nav:hidden @md/nav:backdrop-blur-3xl fixed -bottom-[calc(100svh-120%)] right-[4%] backdrop-blur-xl bg-base-200/60 btn btn-circle  w-16 h-16  shadow-xl isolate">
          <Link
            className={
              "btn btn-circle btn-outline font-bold w-16 h-16 flex-col text-[11px]  gap-1  " +
              (isActive("/trips/new") ? "btn-active" : "")
            }
            href={"/trips/new"}
          >
            <FaPlus className="inline-block" />
            New Trip
          </Link>
        </div>
      )}
    </nav>
  );
}
