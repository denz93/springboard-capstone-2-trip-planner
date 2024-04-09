import { InsertTripSchema, SelectPlaceSchema } from "@/server/db/schema";

export const InsertTripAndItinerarySchema = InsertTripSchema.omit({
  createdAt: true,
  itineraryId: true,
  userId: true
}).extend({
  placeId: SelectPlaceSchema.shape.id,
  startDate: InsertTripSchema.shape.startDate.unwrap().unwrap(),
  endDate: InsertTripSchema.shape.endDate.unwrap().unwrap()
});
