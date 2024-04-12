import { FaGoogle } from "react-icons/fa6";
import { AuthenticationStatus, getLoginSession } from "./session";
import GoogleRedirect from "./redirect";
import { usePathname } from "next/navigation";

export default async function GoogleLogin({
  searchParams
}: {
  searchParams?: { __redirect?: string; reason?: string };
}) {
  const { google } = await getLoginSession();
  if (!google)
    return (
      <div className="w-full text-center italic">
        You are not allowed to access this page
      </div>
    );

  return (
    <div className="w-full text-center">
      <h1>
        Login with Google <FaGoogle className="inline-block" />
      </h1>
      {google.status === AuthenticationStatus.Redirecting && (
        <GoogleRedirect url={google.authenticationUrl ?? ""} />
      )}
      {google.status === AuthenticationStatus.Failure ||
        (google.status ===
          AuthenticationStatus.EmailBelongsToAnotherAccount && (
          <div>
            <p className="font-bold">Some thing went wrong</p>
            <p className="italic">{searchParams?.reason}</p>
          </div>
        ))}
    </div>
  );
}
