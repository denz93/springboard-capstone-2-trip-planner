import {
  InsertTripSchema,
  Itinerary,
  SelectTripSchema,
  UpdateTripSchema,
  Trip,
  db,
  Place,
  SelectUserSchema,
  ItineraryStop
} from "@/server/db";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { type ExtractDrizzleRelations } from "@/server/db/schema.helper";
import { InsertTripAndItinerarySchema } from "./trip.schema";
import { addDays, differenceInCalendarDays } from "date-fns";

export async function findOne(id: z.infer<typeof SelectTripSchema>["id"]) {
  return await db.query.Trip.findFirst({
    where: eq(Trip.id, id)
  });
}

export async function findOneWithRelation(
  id: z.infer<typeof SelectTripSchema>["id"]
) {
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
  });
}

export async function findByUserId(
  userId: NonNullable<z.infer<typeof SelectTripSchema>["userId"]>
) {
  return await db.query.Trip.findMany({
    where: eq(Trip.userId, userId),
    with: {
      itinerary: {
        with: {
          place: true
        }
      }
    }
  });
}

export async function create(trip: z.infer<typeof InsertTripSchema>) {
  return (await db.insert(Trip).values(trip).returning()).at(0);
}

export async function update(trip: z.infer<typeof UpdateTripSchema>) {
  const { id, ...data } = trip;
  return db.transaction(async (tx) => {
    const newTrip = (
      await tx.update(Trip).set(data).where(eq(Trip.id, id)).returning()
    ).at(0);
    if (!newTrip) return undefined;

    tx.update(Itinerary)
      .set({
        days:
          newTrip.endDate && newTrip.startDate
            ? differenceInCalendarDays(newTrip.endDate, newTrip.startDate)
            : 0
      })
      .where(eq(Itinerary.id, newTrip.itineraryId ?? -1));

    return newTrip;
  });
}

export async function remove(id: z.infer<typeof SelectTripSchema>["id"]) {
  const trip = await db.query.Trip.findFirst({
    where: eq(Trip.id, id),
    with: {
      itinerary: true
    }
  });
  if (!trip) return undefined;

  await db.delete(Trip).where(eq(Trip.id, id));
  if (!trip.itinerary?.isPublic)
    await db
      .delete(Itinerary)
      .where(eq(Itinerary.id, trip.itinerary?.id ?? -1));
  return { id: trip.id };
}

export async function createTripAndItinerary(
  userId: z.infer<typeof SelectUserSchema>["id"],
  tripInput: z.infer<typeof InsertTripAndItinerarySchema>
) {
  return await db.transaction(async (tx) => {
    const { placeId, ...tripData } = tripInput;
    const place = await tx.query.Place.findFirst({
      where: eq(Place.id, placeId)
    });
    if (!place) throw new Error("Place not found");

    const itinerary = (
      await tx
        .insert(Itinerary)
        .values({
          ownerId: userId,
          placeId: placeId,
          isPublic: false,
          days: differenceInCalendarDays(
            addDays(tripInput.endDate, 1),
            tripInput.startDate
          ),
          name: place.name
        })
        .returning()
    ).at(0);

    if (!itinerary) throw new Error("Itinerary not created");

    const trip = (
      await tx
        .insert(Trip)
        .values({
          ...tripData,
          userId: userId,
          itineraryId: itinerary.id
        })
        .returning()
    ).at(0);
    return { ...trip, itinerary } as typeof trip & {
      itinerary: typeof itinerary;
    };
  });
}

/**
 * Duplicate itineray details and its stops, and create a new trip associated with it
 * @param itineraryId
 * @param userId
 * @returns [Trip]
 */
export async function createTripFromPublicItinerary(
  itineraryId: number,
  userId: number
) {
  return await db.transaction(async (tx) => {
    const itinerary = await tx.query.Itinerary.findFirst({
      where: eq(Itinerary.id, itineraryId)
    });
    if (!itinerary) throw new Error("Itinerary not found");
    if (!itinerary.isPublic) throw new Error("Itinerary is not public");

    const duplicateItinerary = (
      await tx
        .insert(Itinerary)
        .values({
          ...itinerary,
          ownerId: userId,
          isPublic: false,
          createdAt: undefined,
          id: undefined
        })
        .returning()
    ).at(0);
    if (!duplicateItinerary) throw new Error("Cannot duplicate itinerary");

    const stops = await tx.query.ItineraryStop.findMany({
      where: eq(ItineraryStop.itineraryId, itineraryId)
    });

    const newStops = stops.map((stop) => ({
      ...stop,
      id: undefined,
      itineraryId: duplicateItinerary.id
    }));

    if (newStops.length > 0) {
      await tx.insert(ItineraryStop).values(newStops);
    }

    const trip = (
      await tx
        .insert(Trip)
        .values({
          userId: userId,
          name: duplicateItinerary.name,
          description: duplicateItinerary.description,
          itineraryId: duplicateItinerary.id
        })
        .returning()
    ).at(0);

    if (!trip) throw new Error("Cannot duplicate trip");

    return trip;
  });
}
