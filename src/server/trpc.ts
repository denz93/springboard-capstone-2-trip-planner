import { initTRPC } from '@trpc/server';
import { createContext } from '@/server/modules/auth/auth.helper';
// You can use any variable name you like.
// We use t to keep things simple.
const t = initTRPC.context<Awaited<ReturnType<typeof createContext>>>().create();

export const router = t.router;
export const publicProcedure = t.procedure;