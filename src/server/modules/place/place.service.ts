import {z} from 'zod'
import {InsertPlaceSchema, db, Place} from '@/server/db';

export async function create(place: z.infer<typeof InsertPlaceSchema>) {
  return (await db.insert(Place).values(place).returning()).at(0)
}