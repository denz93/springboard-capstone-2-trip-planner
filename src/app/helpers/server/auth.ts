import {
  extractUserFromSession,
  getAuthSession
} from "@/server/modules/auth/auth.helper";

export async function getUser() {
  return await extractUserFromSession(await getAuthSession());
}
