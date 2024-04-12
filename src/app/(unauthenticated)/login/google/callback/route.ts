import { type NextRequest } from "next/server";
import { claims } from "../google-client";
import { AuthenticationStatus, getLoginSession } from "../session";
import { redirect } from "next/navigation";
import * as authService from "@/server/modules/auth/auth.service";
import * as userService from "@/server/modules/user/user.service";

export async function GET(req: NextRequest) {
  const session = await getLoginSession();
  const { google: googleSession } = session;
  if (!googleSession || session.userId) return redirect("/");

  try {
    const idToken = await claims(
      req.url,
      googleSession.codeVerifier ?? "",
      googleSession.nonce
    );
    const account = await authService.verifyUserAccount({
      type: "google",
      secret: idToken.sub
    });
    if (!account) {
      if (!idToken.email) {
        const reason = "Email not found in Google ID token";
        console.error(reason);
        googleSession.status = AuthenticationStatus.Failure;
        await session.save();
        return redirect("/login/google?reason=" + encodeURIComponent(reason));
      }
      const user = await userService.findByEmailWithAccount(idToken.email);
      if (user) {
        googleSession.status =
          AuthenticationStatus.EmailBelongsToAnotherAccount;
        const reason = `Email ${user.email} already belongs to ${user.account.type} account`;
        await session.save();
        return redirect(`/login/google?reason=${encodeURIComponent(reason)}`);
      }
      const createdAccount = await userService.createUserWithAccount(
        {
          email: idToken.email,
          name:
            idToken.name ?? `${idToken.given_name}` + `${idToken.family_name}`
        },
        {
          type: "google",
          secret: idToken.sub
        }
      );
      if (!createdAccount) {
        googleSession.status = AuthenticationStatus.Failure;
        const reason = "Failed to create user";
        console.error(reason);
        await session.save();
        return redirect("/login/google?reason=" + encodeURIComponent(reason));
      }
      session.userId = createdAccount.userId;
      await session.save();
      return redirect(googleSession.successRedirect ?? "/");
    }

    googleSession.status = AuthenticationStatus.Success;
    session.userId = account.userId;
    await session.save();
    return redirect(googleSession.successRedirect ?? "/");
  } catch (err) {
    if (err instanceof Error && err.message === "NEXT_REDIRECT") {
      throw err;
    }
    console.log(`Error happen`);
    console.error(err);
    googleSession.status = AuthenticationStatus.Failure;
    session.google = { ...googleSession };
    await session.save();
    return redirect("/login/google");
  }
}
