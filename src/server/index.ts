import { publicProcedure, router } from './trpc';
import { db, Trip } from './db'
import { authRouter } from './modules/auth/auth.router';
export const appRouter = router({
  auth: authRouter
});

// Export only the type of a router!
// This prevents us from importing server code on the client.
export type AppRouter = typeof appRouter;