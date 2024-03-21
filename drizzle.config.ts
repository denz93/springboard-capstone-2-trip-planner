import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: "./src/server/db/schema.ts",
  out: "./src/server/db/drizzle",
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DB_URL!,
  },
})