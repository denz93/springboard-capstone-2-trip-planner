import { z } from "zod";
import { InsertPlaceSchema, db, Place } from "@/server/db";

export async function create(place: z.infer<typeof InsertPlaceSchema>) {
  return (
    await db
      .insert(Place)
      .values(place)
      .onConflictDoUpdate({
        target: [Place.provider, Place.providerPlaceId],
        set: {
          lat: place.lat,
          lng: place.lng,
          name: place.name,
          address: place.address,
          imageUrl: place.imageUrl
        }
      })
      .returning()
  ).at(0);
}
