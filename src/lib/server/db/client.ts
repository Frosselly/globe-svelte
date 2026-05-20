import { drizzle } from 'drizzle-orm/postgres-js';
// import { Pool } from 'pg';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import postgres from 'postgres';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = postgres(env.DATABASE_URL, {
	prepare: false,
	max: 1
});
// const pool = new Pool({ connectionString: env.DATABASE_URL });
export const db = drizzle(client);
