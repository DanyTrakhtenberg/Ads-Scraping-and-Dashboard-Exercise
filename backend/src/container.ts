/**
 * Dependency Injection Container
 * Centralized dependency management
 */

import { PostgreSQLConnection } from "./repositories/implementations/PostgreSQLConnection";
import { PostgreSQLAdRepository } from "./repositories/implementations/PostgreSQLAdRepository";
import { AdService } from "./services/AdService";
import { AdController } from "./controllers/AdController";
import { IDatabaseConnection } from "./repositories/interfaces/IDatabaseConnection";
import { IAdRepository } from "./repositories/interfaces/IAdRepository";

/**
 * Container class for dependency injection
 * This allows easy switching of implementations
 */
export class Container {
  private dbConnection: IDatabaseConnection | null = null;
  private adRepository: IAdRepository | null = null;
  private adService: AdService | null = null;
  private adController: AdController | null = null;

  /**
   * Get database connection (singleton)
   */
  getDatabaseConnection(): IDatabaseConnection {
    if (!this.dbConnection) {
      // Switch database implementation here
      this.dbConnection = new PostgreSQLConnection();
      // Future: this.dbConnection = new MongoDBConnection();
      // Future: this.dbConnection = new MySQLConnection();
    }
    return this.dbConnection;
  }

  /**
   * Get ad repository (singleton)
   */
  getAdRepository(): IAdRepository {
    if (!this.adRepository) {
      const db = this.getDatabaseConnection();
      // Switch repository implementation here
      this.adRepository = new PostgreSQLAdRepository(db);
      // Future: this.adRepository = new MongoDBAdRepository(db);
      // Future: this.adRepository = new MySQLAdRepository(db);
    }
    return this.adRepository;
  }

  /**
   * Get ad service (singleton)
   */
  getAdService(): AdService {
    if (!this.adService) {
      const repository = this.getAdRepository();
      this.adService = new AdService(repository);
    }
    return this.adService;
  }

  /**
   * Get ad controller (singleton)
   */
  getAdController(): AdController {
    if (!this.adController) {
      const service = this.getAdService();
      this.adController = new AdController(service);
    }
    return this.adController;
  }

  /**
   * Initialize container (connect to database, etc.)
   */
  async initialize(): Promise<void> {
    const db = this.getDatabaseConnection();
    await db.connect();
  }

  /**
   * Cleanup container (disconnect from database, etc.)
   */
  async cleanup(): Promise<void> {
    if (this.dbConnection) {
      await this.dbConnection.disconnect();
    }
  }
}

// Export singleton instance
export const container = new Container();
