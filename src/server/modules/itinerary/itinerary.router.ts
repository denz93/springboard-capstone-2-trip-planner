import {
  itineraryOwnerProcedure,
  publicProcedure,
  router
} from "@/server/trpc";
import { AddStopSchema, PaginationParamsSchema } from "./itinerary.schema";
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
  }),

  getPublicItineraries: publicProcedure
    .input(
      z.object({
        pagination: PaginationParamsSchema.optional()
      })
    )
    .query(async ({ input }) => {
      const pagination = PaginationParamsSchema.parse(input.pagination);
      const data = await itineraryService.findAll(
        { isPublic: true },
        pagination
      );
      const nextCursor =
        data.length === pagination.limit ? data.at(-1) ?? null : null;
      return { data, nextCursor };
    }),

  makePublic: itineraryOwnerProcedure
    .input(
      z.object({
        isPublic: z.boolean().default(true)
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await itineraryService.publish(
        ctx.itinerary.id,
        ctx.user.id,
        input.isPublic
      );
    })
});
