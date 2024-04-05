import { InsertTripSchema, Itinerary, SelectTripSchema, UpdateTripSchema, Trip, db } from "@/server/db";
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { type ExtractDrizzleRelations } from "@/server/db/schema.helper";

export async function findOne(id: z.infer<typeof SelectTripSchema>["id"]) {
  return await db.query.Trip.findFirst({
    where: eq(Trip.id, id),
  })
}

export async function findOneWithRelation(id: z.infer<typeof SelectTripSchema>["id"]) {
  return await db.query.Trip.findFirst({
    where: eq(Trip.id, id),
    with: {
      itinerary: {
        with: {
          place: true,
          stops: {
            with: {
              place: true
            }
          }
        }
      }
    }
  })
}

export async function findByUserId(userId: NonNullable<z.infer<typeof SelectTripSchema>["userId"]>) {
  return await db.query.Trip.findMany({
    where: eq(Trip.userId, userId),
    with: {
      itinerary: {
        with: {
          place: true
        }
      }
    }
  })
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