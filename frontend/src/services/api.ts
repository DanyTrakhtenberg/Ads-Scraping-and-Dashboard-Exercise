/**
 * API Service
 * Handles all HTTP requests to the backend
 */

import axios from "axios";
import type {
  AdWithRelations,
  AdFilters,
  PaginationParams,
  PaginatedResult,
  Stats,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Ads API
 */
export const adsApi = {
  /**
   * Get paginated ads with optional filters
   */
  getAds: async (
    filters?: AdFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<AdWithRelations>> => {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.platform) {
      params.append("platform", filters.platform);
    }
    if (filters?.startDate) {
      params.append("startDate", filters.startDate);
    }
    if (filters?.endDate) {
      params.append("endDate", filters.endDate);
    }
    if (filters?.pageName) {
      params.append("pageName", filters.pageName);
    }

    if (pagination) {
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());
    }

    const response = await apiClient.get<PaginatedResult<AdWithRelations>>(
      `/ads?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get ad by ID
   */
  getAdById: async (id: string): Promise<AdWithRelations> => {
    const response = await apiClient.get<AdWithRelations>(`/ads/${id}`);
    return response.data;
  },

  /**
   * Get aggregated statistics
   */
  getStats: async (filters?: AdFilters): Promise<Stats> => {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append("status", filters.status);
    }
    if (filters?.platform) {
      params.append("platform", filters.platform);
    }
    if (filters?.startDate) {
      params.append("startDate", filters.startDate);
    }
    if (filters?.endDate) {
      params.append("endDate", filters.endDate);
    }

    const response = await apiClient.get<Stats>(
      `/ads/stats?${params.toString()}`
    );
    return response.data;
  },

  /**
   * Get ads grouped by date
   */
  getAdsByDate: async (
    filters?: AdFilters
  ): Promise<Array<{ date: string; count: number; active: number; inactive: number }>> => {
    const params = new URLSearchParams();

    if (filters?.platform) {
      params.append("platform", filters.platform);
    }

    const response = await apiClient.get<
      Array<{ date: string; count: number; active: number; inactive: number }>
    >(`/ads/stats/by-date?${params.toString()}`);
    return response.data;
  },

  /**
   * Get platform statistics
   */
  getPlatformStats: async (
    filters?: AdFilters
  ): Promise<Array<{ platform: string; count: number }>> => {
    const params = new URLSearchParams();

    if (filters?.status) {
      params.append("status", filters.status);
    }

    const response = await apiClient.get<
      Array<{ platform: string; count: number }>
    >(`/ads/stats/platforms?${params.toString()}`);
    return response.data;
  },
};
