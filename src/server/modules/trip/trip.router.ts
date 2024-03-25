import { InsertTripSchema, SelectTripSchema } from "@/server/db";
import { router, publicProcedure } from "@/server/trpc";
import * as tripService from '@/server/modules/trip/trip.service'
import { z } from 'zod';

export const tripRouter = router({
  getTrip: publicProcedure.input(SelectTripSchema.pick({ id: true })).query(async (opts) => {
    return await tripService.findOne(opts.input.id)
  }),
  getUserTrips: publicProcedure.input(z.object({
    userId: SelectTripSchema.shape.userId.unwrap()
  })).query(async (opts) => {
    return await tripService.findByUserId(opts.input.userId)
  }),
  create: publicProcedure
    .input(InsertTripSchema)
    .mutation(async (opts) => {
      const trip = await tripService.create(opts.input)
      return trip
    }),
  getTripWithItinerary: publicProcedure.input(SelectTripSchema.pick({ id: true })).query(async (opts) => {
    return await tripService.findOneWithRelation(opts.input.id)
  })
})