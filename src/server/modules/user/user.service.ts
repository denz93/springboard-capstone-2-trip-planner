import {z} from 'zod';
import {User, InsertUserSchema, db, SelectUserSchema} from '@/server/db'
import {eq} from 'drizzle-orm';

export async function createUser(user: z.infer<typeof InsertUserSchema>) {
  return (await db.insert(User).values(user).returning()).at(0)
}

export async function findByEmail(email: z.infer<typeof InsertUserSchema>["email"]) {
  return (await db.select().from(User).where(eq(User.email, email))).at(0)
}

export async function findOne(id: z.infer<typeof SelectUserSchema>["id"]) {
  return (await db.select().from(User).where(eq(User.id, id))).at(0)
}