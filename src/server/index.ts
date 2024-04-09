import { publicProcedure, router } from "./trpc";
import { authRouter } from "./modules/auth/auth.router";
import { tripRouter } from "@/server/modules/trip/trip.router";
import { itineraryRouter } from "./modules/itinerary/itinerary.router";
import { placeRouter } from "./modules/place/place.router";
import { userRouter } from "./modules/user/user.route";

import { initData, testCleanUp } from "./__tests__/helpers";
export const appRouter = router({
  auth: authRouter,
  trip: tripRouter,
  itinerary: itineraryRouter,
  place: placeRouter,
  user: userRouter,
  ...developmentRoute()
});

function developmentRoute() {
  if (process.env.NODE_ENV === "production") return undefined;
  return {
    generate: publicProcedure.query(async () => {
      await testCleanUp();
      return await initData();
    })
  };
}

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;
