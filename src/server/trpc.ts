import { TRPCError, initTRPC } from "@trpc/server";
import { createContext } from "@/server/modules/auth/auth.helper";
import superjson from "superjson";
import { z } from "zod";
import { Trip, db, Itinerary } from "./db";
import { and, eq } from "drizzle-orm";
// You can use any variable name you like.
// We use t to keep things simple.
const t = initTRPC.context<Awaited<ReturnType<typeof createContext>>>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const authProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const tripOwnerProcedure = authProcedure
  .input(z.object({ id: z.number() }))
  .use(async ({ ctx, input, next }) => {
    const trip = await db.query.Trip.findFirst({
      where: and(eq(Trip.id, input.id), eq(Trip.userId, ctx.user.id)),
    });
    if (!trip) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return next({
      ctx: {
        trip,
      },
    });
  });

export const itineraryOwnerProcedure = authProcedure
  .input(z.object({ id: z.number() }))
  .use(async ({ ctx, input, next }) => {
    const itinerary = db.query.Itinerary.findFirst({
      where: and(
        eq(Itinerary.id, input.id),
        eq(Itinerary.ownerId, ctx.user.id),
      ),
      with: {
        place: true,
      },
    });
    if (!itinerary) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return next({
      ctx: {
        itinerary: itinerary,
      },
    });
  });
