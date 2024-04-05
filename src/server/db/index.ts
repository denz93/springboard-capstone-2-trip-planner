import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as Schema from './schema';
export * from './schema';
declare global {
  var postgresClient: postgres.Sql | undefined
}

if (process.env.NODE_ENV != 'production') {
  console.log(`DB_URL: ${process.env.DB_URL}`)
}
if (!globalThis.postgresClient) {
  console.log("initial new database connections")
  console.log(globalThis.postgresClient)
  globalThis.postgresClient = postgres(process.env.DB_URL)
}
// for migrations
migrate(drizzle(globalThis.postgresClient), { migrationsFolder: "./drizzle" }).catch(e => {
  console.log(e.toString())
})
// for query purposes
export const db = drizzle(globalThis.postgresClient, { schema: Schema });
