import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const queryClient = postgres(process.env.DATABASE_URL_MIGRATE, {});

migrate(drizzle(queryClient), { migrationsFolder: 'migrations' }).finally(() => queryClient.end());
