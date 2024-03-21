import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as Schema from './schema';
export * from './schema';
if (process.env.NODE_ENV != 'production') {
  console.log(`DB_URL: ${process.env.DB_URL}`)
}
// for migrations
const migrationClient = postgres(process.env.DB_URL, { max: 1 });
migrate(drizzle(migrationClient), {migrationsFolder: "./drizzle"}).catch(e => {
  console.log(e.toString())
})


// for query purposes
const queryClient = postgres(process.env.DB_URL);
export const db = drizzle(queryClient, {schema: Schema });
