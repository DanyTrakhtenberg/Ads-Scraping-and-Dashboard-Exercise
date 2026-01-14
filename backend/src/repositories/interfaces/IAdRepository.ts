/**
 * Ad Repository Interface
 * This abstraction allows switching database implementations
 */

import { Ad, AdWithRelations, AdFilters, PaginationParams, PaginatedResult } from "../../types";

export interface IAdRepository {
  /**
   * Find all ads with optional filters and pagination
   */
  findAll(filters?: AdFilters, pagination?: PaginationParams): Promise<PaginatedResult<AdWithRelations>>;

  /**
   * Find ad by ID
   */
  findById(id: string): Promise<AdWithRelations | null>;

  /**
   * Find ad by Facebook Library ID (ad_id)
   */
  findByAdId(adId: string): Promise<AdWithRelations | null>;

  /**
   * Count ads with filters
   */
  count(filters?: AdFilters): Promise<number>;

  /**
   * Get ads grouped by date for charting
   */
  getAdsByDate(filters?: AdFilters): Promise<Array<{ date: string; count: number; active: number; inactive: number }>>;

  /**
   * Get platform statistics
   */
  getPlatformStats(filters?: AdFilters): Promise<Array<{ platform: string; count: number }>>;
}
