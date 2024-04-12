import { InsertItineraryStopSchema } from "@/server/db";
import { z } from "zod";

export const ItinerarySearchFilterSchema = z.object({
  isPublic: z.boolean().default(true),
  ownerId: z.number().optional()
});

export const AddStopSchema = InsertItineraryStopSchema.omit({
  itineraryId: true
});

export const PaginationParamsSchema = z.object({
  cursor: z.number().default(0),
  limit: z.number().min(1).max(100).default(10)
});

export const PaginationSchema = z.object({
  nextCursor: z.number().nullable()
});
