import {db, InsertItineraryStopSchema, Itinerary, InsertItinerarySchema, UpdateItinerarySchema, SelectItinerarySchema, ItineraryStop, SelectItineraryStopSchema} from "@/server/db";
import {z} from 'zod'
import {eq, and} from 'drizzle-orm';
import * as itineraryStopService from '@/server/modules/itinerary-stop/itinerary-stop.service'
import { ItinerarySearchFilterSchema } from "@/server/modules/itinerary/itinerary.schema";
export async function findOne(id: z.infer<typeof SelectItinerarySchema>["id"]) {
  return (await db.select().from(Itinerary).where(eq(Itinerary.id, id))).at(0)
}

export async function findAll(filter: z.infer<typeof ItinerarySearchFilterSchema>) {
  return await db.query.Itinerary.findMany({
    where: eq(Itinerary.isPublic, filter.isPublic)
  })
}
export async function create(itinerary: z.infer<typeof InsertItinerarySchema>) {
  return (await db.insert(Itinerary).values(itinerary).returning()).at(0)
}

export async function update(itinerary: z.infer<typeof UpdateItinerarySchema>) {
  const {id, ...data} = itinerary
  const result = await db.update(Itinerary).set(data).where(eq(Itinerary.id, id)).returning()
  return result[0]
}

export async function publish(id: z.infer<typeof SelectItinerarySchema>["id"], owner_id: NonNullable<z.infer<typeof InsertItinerarySchema>["ownerId"]>) {
  const result = await db
    .update(Itinerary)
    .set({isPublic: true})
    .where(
      and(
        eq(Itinerary.id, id),
        eq(Itinerary.ownerId, owner_id)
      )
    ).returning()
  return result[0]
}

export async function addStop(itineraryId: z.infer<typeof SelectItinerarySchema>["id"], stop: z.infer<typeof InsertItineraryStopSchema>) {
  stop.itineraryId = itineraryId
  return await itineraryStopService.create(stop)
}

export async function reorderStop(
  itineraryId: z.infer<typeof SelectItinerarySchema>["id"], 
  stop: z.infer<typeof SelectItineraryStopSchema>) {
  
  const itinerary = db.$with('i').as(
    db.select().from(Itinerary).where(eq(Itinerary.id, itineraryId))
  )
  const result = await db
    .with(itinerary)
    .update(ItineraryStop)
    .set({ordinalDay: stop.ordinalDay})
    .where(
      and(
        eq(ItineraryStop.id, stop.id),
        eq(ItineraryStop.itineraryId, itineraryId),
        eq(itinerary.isPublic, false)
      )
    ).returning()
  return result[0]

}