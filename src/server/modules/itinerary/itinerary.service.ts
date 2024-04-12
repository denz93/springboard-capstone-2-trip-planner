import {
  db,
  InsertItineraryStopSchema,
  Itinerary,
  InsertItinerarySchema,
  UpdateItinerarySchema,
  SelectItinerarySchema,
  ItineraryStop,
  SelectItineraryStopSchema,
  Place
} from "@/server/db";
import { z } from "zod";
import { eq, and, sql } from "drizzle-orm";
import * as itineraryStopService from "@/server/modules/itinerary-stop/itinerary-stop.service";
import {
  ItinerarySearchFilterSchema,
  PaginationParamsSchema
} from "@/server/modules/itinerary/itinerary.schema";
export async function findOne(id: z.infer<typeof SelectItinerarySchema>["id"]) {
  return (await db.select().from(Itinerary).where(eq(Itinerary.id, id))).at(0);
}
export async function findOneWithRelation(
  id: z.infer<typeof SelectItinerarySchema>["id"]
) {
  return await db.query.Itinerary.findFirst({
    where: eq(Itinerary.id, id),
    with: {
      place: true,
      stops: {
        with: {
          place: true
        }
      }
    }
  });
}

export async function findAll(
  filter: z.infer<typeof ItinerarySearchFilterSchema>,
  pagination: z.infer<typeof PaginationParamsSchema>
) {
  const result = await db
    .select()
    .from(Itinerary)
    .leftJoin(Place, eq(Itinerary.placeId, Place.id))
    .where(
      (aliases) =>
        sql`${aliases.itineraries.isPublic} = ${filter.isPublic} and ${aliases.itineraries.id} > ${pagination.cursor}`
    )
    .limit(pagination.limit)
    .orderBy((aliases) => sql`${aliases.itineraries.id} asc`);
  const aggregate = result.map((data) => {
    return {
      ...data.itineraries,
      place: data.places
    };
  });
  return aggregate;
}
export async function create(itinerary: z.infer<typeof InsertItinerarySchema>) {
  return (await db.insert(Itinerary).values(itinerary).returning()).at(0);
}

export async function update(itinerary: z.infer<typeof UpdateItinerarySchema>) {
  const { id, ...data } = itinerary;
  const result = await db
    .update(Itinerary)
    .set(data)
    .where(eq(Itinerary.id, id))
    .returning();
  return result[0];
}

export async function publish(
  id: z.infer<typeof SelectItinerarySchema>["id"],
  ownerId: NonNullable<z.infer<typeof InsertItinerarySchema>["ownerId"]>,
  isPublic: boolean
) {
  const result = await db
    .update(Itinerary)
    .set({ isPublic })
    .where(and(eq(Itinerary.id, id), eq(Itinerary.ownerId, ownerId)))
    .returning();
  return result[0];
}

export async function addStop(
  itineraryId: z.infer<typeof SelectItinerarySchema>["id"],
  stop: z.infer<typeof InsertItineraryStopSchema>
) {
  stop.itineraryId = itineraryId;
  return await itineraryStopService.create(stop);
}

export async function reorderStop(
  itineraryId: z.infer<typeof SelectItinerarySchema>["id"],
  stop: z.infer<typeof SelectItineraryStopSchema>
) {
  const itinerary = db
    .$with("i")
    .as(db.select().from(Itinerary).where(eq(Itinerary.id, itineraryId)));
  const result = await db
    .with(itinerary)
    .update(ItineraryStop)
    .set({ ordinalDay: stop.ordinalDay })
    .where(
      and(
        eq(ItineraryStop.id, stop.id),
        eq(ItineraryStop.itineraryId, itineraryId),
        eq(itinerary.isPublic, false)
      )
    )
    .returning();
  return result[0];
}

export async function removeStop(id: number, stopId: number) {
  await db
    .delete(ItineraryStop)
    .where(
      and(eq(ItineraryStop.id, stopId), eq(ItineraryStop.itineraryId, id))
    );

  return true;
}
