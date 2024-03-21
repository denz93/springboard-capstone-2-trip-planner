import { InsertTripSchema, Itinerary, SelectTripSchema, UpdateTripSchema } from "@/server/db";
import { z } from 'zod';
import { Trip, db } from '@/server/db';
import { NotNull, eq } from 'drizzle-orm';
import * as itineraryService from '../itinerary/itinerary.service';

export async function findOne(id: z.infer<typeof SelectTripSchema>["id"]) {
  return (await db.select().from(Trip).where(eq(Trip.id, id))).at(0)
}

export async function findByUserId(userId: NonNullable<z.infer<typeof SelectTripSchema>["userId"]>) {
  return (await db.select().from(Trip).where(eq(Trip.userId, userId)))
}

export async function create(trip: z.infer<typeof InsertTripSchema>) {
  return (await db.insert(Trip).values(trip).returning()).at(0)
}

export async function update(trip: z.infer<typeof UpdateTripSchema>) {
  const { id, ...data } = trip
  const result = await db.update(Trip).set(data).where(eq(Trip.id, id)).returning()
  return result[0]
}

export async function remove(id: z.infer<typeof SelectTripSchema>["id"]) {
  const trip = await db.query.Trip.findFirst({
    where: eq(Trip.id, id),
    with: {
      itinerary: true
    }
  })
  if (!trip)
    return undefined

  await db.delete(Trip).where(eq(Trip.id, id))
  if (!trip.itinerary?.isPublic)
    await db.delete(Itinerary).where(eq(Itinerary.id, trip.itinerary?.id ?? -1))
  return { id: trip.id }
}