import { getSession } from "@/server/modules/session/session.service";
export enum AuthenticationStatus {
  Success = "success",
  Failure = "failure",
  Redirecting = "redirecting",
  EmailBelongsToAnotherAccount = "email-belongs-to-another-account"
}
export async function getLoginSession() {
  return getSession<{
    google?: {
      successRedirect?: string;
      codeVerifier?: string;
      status: AuthenticationStatus;
      authenticationUrl?: string;
      nonce?: string;
    };
    userId?: number;
  }>();
}
