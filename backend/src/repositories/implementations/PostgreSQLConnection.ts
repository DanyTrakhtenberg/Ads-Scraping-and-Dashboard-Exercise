/**
 * PostgreSQL Database Connection Implementation
 */

import { Pool, PoolClient } from "pg";
import { IDatabaseConnection } from "../interfaces/IDatabaseConnection";
import { getDatabaseConfig } from "../../config/database.config";

export class PostgreSQLConnection implements IDatabaseConnection {
  private pool: Pool;
  private connected: boolean = false;

  constructor() {
    const config = getDatabaseConfig();
    this.pool = new Pool({
      connectionString: config.connectionString,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
    });

    // Handle pool errors
    this.pool.on("error", (err) => {
      console.error("Unexpected error on idle PostgreSQL client", err);
      this.connected = false;
    });
  }

  async connect(): Promise<void> {
    try {
      await this.pool.query("SELECT 1");
      this.connected = true;
      console.log("Connected to PostgreSQL database");
    } catch (error) {
      this.connected = false;
      console.error("Error connecting to PostgreSQL:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    this.connected = false;
    console.log("Disconnected from PostgreSQL database");
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    try {
      const result = await this.pool.query(text, params);
      return result.rows as T[];
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }

  async queryOne<T = any>(text: string, params?: any[]): Promise<T | null> {
    const rows = await this.query<T>(text, params);
    return rows.length > 0 ? rows[0] : null;
  }

  getClient(): Pool {
    return this.pool;
  }

  isConnected(): boolean {
    return this.connected;
  }
}
