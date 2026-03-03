import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '$env/dynamic/private';
import * as schema from './schema';
import * as authSchema from './auth.schema';

if (!env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in your environment variables');
}

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema: { ...schema, ...authSchema } });