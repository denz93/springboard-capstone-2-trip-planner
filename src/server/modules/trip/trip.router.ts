import {
  InsertTripSchema,
  SelectTripSchema,
  UpdateTripSchema
} from "@/server/db";
import {
  router,
  publicProcedure,
  tripOwnerProcedure,
  authProcedure
} from "@/server/trpc";
import * as tripService from "@/server/modules/trip/trip.service";
import { z } from "zod";
import { InsertTripAndItinerarySchema } from "./trip.schema";

export const tripRouter = router({
  getTrip: authProcedure
    .input(SelectTripSchema.pick({ id: true }))
    .query(async (opts) => {
      return await tripService.findOne(opts.input.id);
    }),
  getUserTrips: authProcedure
    .input(
      z.object({
        userId: SelectTripSchema.shape.userId.unwrap()
      })
    )
    .query(async (opts) => {
      return await tripService.findByUserId(opts.input.userId);
    }),
  create: authProcedure.input(InsertTripSchema).mutation(async (opts) => {
    const trip = await tripService.create(opts.input);
    return trip;
  }),
  getTripWithItinerary: authProcedure
    .input(SelectTripSchema.pick({ id: true }))
    .query(async (opts) => {
      return await tripService.findOneWithRelation(opts.input.id);
    }),

  update: tripOwnerProcedure.input(UpdateTripSchema).mutation(async (opts) => {
    return await tripService.update(opts.input);
  }),
  createWithItinerary: authProcedure
    .input(InsertTripAndItinerarySchema)
    .mutation(async (opts) => {
      return await tripService.createTripAndItinerary(
        opts.ctx.user.id,
        opts.input
      );
    }),

  remove: tripOwnerProcedure.mutation(async (opts) => {
    return await tripService.remove(opts.input.id);
  })
});
