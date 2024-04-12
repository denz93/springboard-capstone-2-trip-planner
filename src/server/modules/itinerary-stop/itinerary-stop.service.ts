import { InsertItineraryStopSchema } from "@/server/db";
import { db, ItineraryStop } from "@/server/db";
import { z } from "zod";
import { eq } from "drizzle-orm";

export async function create(stop: z.infer<typeof InsertItineraryStopSchema>) {
  return (await db.insert(ItineraryStop).values(stop).returning()).at(0);
}

export async function findByItineraryId(
  itineraryId: NonNullable<
    z.infer<typeof InsertItineraryStopSchema>["itineraryId"]
  >
) {
  return await db
    .select()
    .from(ItineraryStop)
    .where(eq(ItineraryStop.itineraryId, itineraryId));
}
