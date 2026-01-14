/**
 * Database configuration
 * This abstraction allows switching databases in the future
 */

export interface DatabaseConfig {
  connectionString: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
}

export const getDatabaseConfig = (): DatabaseConfig => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Parse connection string if needed
  // For now, we'll use the connection string directly
  return {
    connectionString,
  };
};
