import { generateAuthorizationUrl } from "../google-client";
import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { AuthenticationStatus, getLoginSession } from "../session";

export async function GET(req: NextRequest) {
  const __redirect = req.nextUrl.searchParams.get("__redirect") ?? "/";
  const { codeVerifier, url, nonce } = await generateAuthorizationUrl();
  const session = await getLoginSession();
  session.google = {
    codeVerifier: codeVerifier,
    successRedirect: __redirect,
    status: AuthenticationStatus.Redirecting,
    authenticationUrl: url,
    nonce
  };

  await session.save();
  return redirect("/login/google");
}
