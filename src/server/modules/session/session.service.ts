import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

const SESSION_PASSWORD = process.env.SESSION_PASSWORD || "";
const SESSION_NAME = "iron_session";
if (process.env.NODE_ENV !== "production") {
  console.log(`SESSION_PASSWORD: ${SESSION_PASSWORD}`);
  console.log(`SESSION_NAME: ${SESSION_NAME}`);
}
export async function getSession<T extends Record<string, any>>() {
  return await getIronSession<T>(cookies(), {
    password: SESSION_PASSWORD,
    cookieName: SESSION_NAME,
    cookieOptions: {
      // Safari enforce secure: true
      secure: process.env.NODE_ENV === "production"
    }
  });
}
