import { publicProcedure, router } from './trpc';
import {db, Trip} from './db'

export const appRouter = router({
  getTrips: publicProcedure.query(async () => {
    return db.select().from(Trip)
  })
});
 
// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;