import { publicProcedure, router } from './trpc';
import { db, Trip } from './db'
import { authRouter } from './modules/auth/auth.router';
import { tripRouter } from '@/server/modules/trip/trip.router';
export const appRouter = router({
  auth: authRouter,
  trip: tripRouter
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;