/**
 * Ad Controller
 * HTTP request handlers
 */

import { Request, Response } from "express";
import { AdService } from "../services/AdService";
import { AdFilters, PaginationParams, AdStatus } from "../types";

export class AdController {
  constructor(private adService: AdService) {}

  /**
   * GET /api/ads
   * Get paginated ads with optional filters
   */
  getAds = async (req: Request, res: Response): Promise<void> => {
    const filters: AdFilters = {};
    const pagination: PaginationParams = {
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };

    // Parse filters from query params
    if (req.query.status) {
      filters.status = req.query.status as AdStatus;
    }

    if (req.query.platform) {
      filters.platform = req.query.platform as string;
    }

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    if (req.query.pageName) {
      filters.pageName = req.query.pageName as string;
    }

    const result = await this.adService.getAds(filters, pagination);
    res.json(result);
  };

  /**
   * GET /api/ads/:id
   * Get ad by ID
   */
  getAdById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const ad = await this.adService.getAdById(id);

    if (!ad) {
      res.status(404).json({ error: "Ad not found" });
      return;
    }

    res.json(ad);
  };

  /**
   * GET /api/ads/stats
   * Get aggregated statistics
   */
  getStats = async (req: Request, res: Response): Promise<void> => {
    const filters: AdFilters = {};

    if (req.query.status) {
      filters.status = req.query.status as AdStatus;
    }

    if (req.query.platform) {
      filters.platform = req.query.platform as string;
    }

    if (req.query.startDate) {
      filters.startDate = new Date(req.query.startDate as string);
    }

    if (req.query.endDate) {
      filters.endDate = new Date(req.query.endDate as string);
    }

    const stats = await this.adService.getStats(filters);
    res.json(stats);
  };

  /**
   * GET /api/ads/stats/by-date
   * Get ads grouped by date
   */
  getAdsByDate = async (req: Request, res: Response): Promise<void> => {
    const filters: AdFilters = {};

    if (req.query.platform) {
      filters.platform = req.query.platform as string;
    }

    const byDate = await this.adService.getAdsByDate(filters);
    res.json(byDate);
  };

  /**
   * GET /api/ads/stats/platforms
   * Get platform statistics
   */
  getPlatformStats = async (req: Request, res: Response): Promise<void> => {
    const filters: AdFilters = {};

    if (req.query.status) {
      filters.status = req.query.status as AdStatus;
    }

    const byPlatform = await this.adService.getPlatformStats(filters);
    res.json(byPlatform);
  };
}
