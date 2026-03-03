import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  // Use a glob pattern to catch the schema file more reliably
  schema: ['./src/lib/server/db/schema.ts', './src/lib/server/db/auth.schema.ts'],
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Adding these ensures Drizzle is more verbose about what it finds
  verbose: true,
  strict: true,
});