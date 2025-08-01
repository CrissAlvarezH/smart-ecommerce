import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import crypto from 'crypto';

type DbInfo = {
  name: string;
  url: string;
};

export async function createTestDatabase(): Promise<DbInfo> {
  const randomSuffix = crypto.randomBytes(6).toString('hex');
  const dbTestName = `test_db_${randomSuffix}`;

  // Use environment variables loaded from .env file
  const DB_USER = process.env.DB_USER;
  const DB_PASS = process.env.DB_PASS;
  const DB_HOST = process.env.DB_HOST;
  const DB_PORT = process.env.DB_PORT;
  const DB_NAME = process.env.DB_NAME;

  if (!DB_USER || !DB_PASS || !DB_HOST || !DB_PORT) {
    throw new Error('Missing required database environment variables. Make sure .env file is loaded.');
  }

  // Connect to postgres database to create the test database
  const postgresUrl = `postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
  console.log('postgresUrl', postgresUrl);
  const client = postgres(postgresUrl);

  try {
    await client.unsafe(`CREATE DATABASE "${dbTestName}"`);
  } catch (err) {
    console.log('err', err);
    throw new Error(`Failed to create test database: ${err}`);
  } finally {
    await client.end();
  }

  // Connect to the new test database to run migrations
  const dbTestUrl = `postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${dbTestName}`;
  const migrationClient = postgres(dbTestUrl);
  const db = drizzle(migrationClient);
  
  try {
    await migrate(db, { migrationsFolder: 'db/migrations' });
  } catch (err) {
    throw new Error('Failed to run migrations on test database: ' + err);
  } finally {
    await migrationClient.end();
  }

  return { name: dbTestName, url: dbTestUrl };
}

export async function dropTestDatabase(dbName: string) {
  // Use environment variables loaded from .env file
  const DB_USER = process.env.DB_USER;
  const DB_PASS = process.env.DB_PASS;
  const DB_HOST = process.env.DB_HOST;
  const DB_PORT = process.env.DB_PORT;

  if (!DB_USER || !DB_PASS || !DB_HOST || !DB_PORT) {
    throw new Error('Missing required database environment variables. Make sure .env file is loaded.');
  }

  // Connect to the postgres database to drop the test database
  const postgresUrl = `postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/postgres`;
  const client = postgres(postgresUrl);

  try {
    // Terminate any active connections to the test database
    await client.unsafe(`
      SELECT pg_terminate_backend(pid)
      FROM pg_stat_activity
      WHERE datname = '${dbName}' AND pid <> pg_backend_pid()
    `);

    await client.unsafe(`DROP DATABASE IF EXISTS "${dbName}"`);
  } catch (err) {
    console.warn(`Failed to drop test database ${dbName}:`, err);
  } finally {
    await client.end();
  }
}
