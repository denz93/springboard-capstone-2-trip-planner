import { itineraryOwnerProcedure, router } from "@/server/trpc";
import { AddStopSchema } from "./itinerary.schema";
import * as itineraryService from "./itinerary.service";
import { InsertItineraryStopSchema } from "@/server/db";
import { z } from "zod";
export const itineraryRouter = router({
  addStop: itineraryOwnerProcedure
    .input(z.object({ stop: InsertItineraryStopSchema }))
    .mutation(async ({ ctx, input }) => {
      return await itineraryService.addStop(ctx.itinerary.id, input.stop);
    }),

  removeStop: itineraryOwnerProcedure
    .input(z.object({ stopId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await itineraryService.removeStop(ctx.itinerary.id, input.stopId);
    }),

  findOneWithRelation: itineraryOwnerProcedure.query(async ({ ctx }) => {
    return await itineraryService.findOneWithRelation(ctx.itinerary.id);
  })
});
