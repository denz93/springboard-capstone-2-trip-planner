import { z } from "zod";

export const insertItineraryStopWith3rdParty = z.object({
  name: z.string().optional(),
  ordinalDay: z.number(),
  placeIdThirdParty: z.string(),
});
