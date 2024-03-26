import { publicProcedure, router } from './trpc';
import { db, Trip } from './db'
import { authRouter } from './modules/auth/auth.router';
import { tripRouter } from '@/server/modules/trip/trip.router';
import { initData, testCleanUp } from './__tests__/helpers';
export const appRouter = router({
  auth: authRouter,
  trip: tripRouter,
  ...developmentRoute()
});

function developmentRoute() {
  if (process.env.NODE_ENV === "production") return undefined
  return {
    generate: publicProcedure.query(async () => {
      await testCleanUp()
      return await initData()
    })
  }
}

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;