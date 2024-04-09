import { InsertItineraryStopSchema } from '@/server/db';
import { z } from 'zod';

export const ItinerarySearchFilterSchema = z.object({
  isPublic: z.boolean().default(true),
  ownerId: z.number().optional()
})

export const AddStopSchema = InsertItineraryStopSchema.omit({ "itineraryId": true })