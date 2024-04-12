import { z } from "zod";
import {
  User,
  InsertUserSchema,
  db,
  SelectUserSchema,
  InsertAccountSchema,
  Account
} from "@/server/db";
import { eq } from "drizzle-orm";

export async function createUser(user: z.infer<typeof InsertUserSchema>) {
  return (await db.insert(User).values(user).returning()).at(0);
}

export async function findByEmail(
  email: z.infer<typeof InsertUserSchema>["email"]
) {
  return (await db.select().from(User).where(eq(User.email, email))).at(0);
}

export async function findOne(id: z.infer<typeof SelectUserSchema>["id"]) {
  return (await db.select().from(User).where(eq(User.id, id))).at(0);
}

export async function update(
  userId: z.infer<typeof SelectUserSchema>["id"],
  partialUser: Partial<
    Omit<z.infer<typeof InsertUserSchema>, "id" | "createdAt">
  >
) {
  return (
    await db
      .update(User)
      .set(partialUser)
      .where(eq(User.id, userId))
      .returning()
  ).at(0);
}

export async function findByEmailWithAccount(email: string) {
  return await db.query.User.findFirst({
    where: eq(User.email, email),
    with: {
      account: true
    }
  });
}

export async function createUserWithAccount(
  user: z.infer<typeof InsertUserSchema>,
  account: Pick<
    z.infer<typeof InsertAccountSchema>,
    "type" | "secret" | "metadata"
  >
) {
  return db.transaction(async (tx) => {
    const u = (await tx.insert(User).values(user).returning()).at(0);
    if (!u) {
      tx.rollback();
      return undefined;
    }
    const a = (
      await tx
        .insert(Account)
        .values({ ...account, userId: u.id })
        .returning()
    ).at(0);
    if (!a) {
      tx.rollback();
      return undefined;
    }
    return a;
  });
}
