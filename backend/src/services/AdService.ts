/**
 * Ad Service
 * Business logic layer
 */

import { IAdRepository } from "../repositories/interfaces/IAdRepository";
import {
  AdWithRelations,
  AdFilters,
  PaginationParams,
  PaginatedResult,
  AdStatus,
} from "../types";

export class AdService {
  constructor(private adRepository: IAdRepository) {}

  async getAds(
    filters?: AdFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<AdWithRelations>> {
    return await this.adRepository.findAll(filters, pagination);
  }

  async getAdById(id: string): Promise<AdWithRelations | null> {
    return await this.adRepository.findById(id);
  }

  async getAdByAdId(adId: string): Promise<AdWithRelations | null> {
    return await this.adRepository.findByAdId(adId);
  }

  async getAdsCount(filters?: AdFilters): Promise<number> {
    return await this.adRepository.count(filters);
  }

  async getAdsByDate(
    filters?: AdFilters
  ): Promise<Array<{ date: string; count: number; active: number; inactive: number }>> {
    return await this.adRepository.getAdsByDate(filters);
  }

  async getPlatformStats(
    filters?: AdFilters
  ): Promise<Array<{ platform: string; count: number }>> {
    return await this.adRepository.getPlatformStats(filters);
  }

  async getStats(filters?: AdFilters) {
    const [total, activeCount, inactiveCount, byDate, byPlatform] = await Promise.all([
      this.adRepository.count(filters),
      this.adRepository.count({ ...filters, status: AdStatus.ACTIVE }),
      this.adRepository.count({ ...filters, status: AdStatus.INACTIVE }),
      this.adRepository.getAdsByDate(filters),
      this.adRepository.getPlatformStats(filters),
    ]);

    return {
      total,
      active: activeCount,
      inactive: inactiveCount,
      byDate,
      byPlatform,
    };
  }
}
