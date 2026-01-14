/**
 * Database Connection Interface
 * Allows switching between different database implementations
 */

export interface IDatabaseConnection {
  /**
   * Connect to the database
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  disconnect(): Promise<void>;

  /**
   * Execute a query
   */
  query<T = any>(text: string, params?: any[]): Promise<T[]>;

  /**
   * Execute a query and return a single row
   */
  queryOne<T = any>(text: string, params?: any[]): Promise<T | null>;

  /**
   * Get database client (for transaction support)
   */
  getClient?(): any;

  /**
   * Check if connected
   */
  isConnected(): boolean;
}
