/**
 * PostgreSQL Ad Repository Implementation
 */

import { IAdRepository } from "../interfaces/IAdRepository";
import { IDatabaseConnection } from "../interfaces/IDatabaseConnection";
import {
  Ad,
  AdWithRelations,
  AdFilters,
  PaginationParams,
  PaginatedResult,
  AdVersion,
  AdPlatform,
  AdStatus,
  AssetType,
} from "../../types";

export class PostgreSQLAdRepository implements IAdRepository {
  constructor(private db: IDatabaseConnection) {}

  async findAll(
    filters?: AdFilters,
    pagination?: PaginationParams
  ): Promise<PaginatedResult<AdWithRelations>> {
    const page = pagination?.page || 1;
    const limit = pagination?.limit || 50;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      whereConditions.push(`a.status = $${paramIndex}`);
      queryParams.push(filters.status);
      paramIndex++;
    }

    if (filters?.startDate) {
      whereConditions.push(`a.start_date >= $${paramIndex}`);
      queryParams.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      whereConditions.push(`a.end_date <= $${paramIndex}`);
      queryParams.push(filters.endDate);
      paramIndex++;
    }

    if (filters?.pageName) {
      whereConditions.push(`a.page_name ILIKE $${paramIndex}`);
      queryParams.push(`%${filters.pageName}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    // Platform filter requires a subquery or JOIN
    let platformJoin = "";
    const countQueryParams = [...queryParams];
    let countParamIndex = paramIndex;
    
    if (filters?.platform) {
      platformJoin = `INNER JOIN ad_platforms ap ON a.id = ap.ad_id AND ap.platform = $${countParamIndex}`;
      countQueryParams.push(filters.platform);
      countParamIndex++;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(DISTINCT a.id) as total
      FROM ads a
      ${platformJoin}
      ${whereClause}
    `;
    const countResult = await this.db.queryOne<{ total: string }>(countQuery, countQueryParams);
    const total = parseInt(countResult?.total || "0", 10);

    // Get paginated ads (re-build params with platform filter)
    const adsQueryParams = [...queryParams];
    let adsParamIndex = paramIndex;
    
    if (filters?.platform) {
      platformJoin = `INNER JOIN ad_platforms ap ON a.id = ap.ad_id AND ap.platform = $${adsParamIndex}`;
      adsQueryParams.push(filters.platform);
      adsParamIndex++;
    }
    
    adsQueryParams.push(limit, offset);
    const adsQuery = `
      SELECT DISTINCT
        a.id, a.ad_id, a.status, a.start_date, a.end_date,
        a.page_name, a.page_profile_uri, a.created_at, a.updated_at
      FROM ads a
      ${platformJoin}
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${adsParamIndex} OFFSET $${adsParamIndex + 1}
    `;

    const ads = await this.db.query<Ad>(adsQuery, adsQueryParams);

    // Fetch versions and platforms for each ad
    const adsWithRelations: AdWithRelations[] = await Promise.all(
      ads.map(async (ad) => {
        const [versions, platforms] = await Promise.all([
          this.getVersionsByAdId(ad.id),
          this.getPlatformsByAdId(ad.id),
        ]);

        return {
          ...ad,
          status: ad.status as AdStatus,
          versions,
          platforms,
        };
      })
    );

    return {
      data: adsWithRelations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<AdWithRelations | null> {
    const query = `
      SELECT id, ad_id, status, start_date, end_date,
             page_name, page_profile_uri, created_at, updated_at
      FROM ads
      WHERE id = $1
    `;

    const ad = await this.db.queryOne<Ad>(query, [id]);
    if (!ad) return null;

    const [versions, platforms] = await Promise.all([
      this.getVersionsByAdId(ad.id),
      this.getPlatformsByAdId(ad.id),
    ]);

    return {
      ...ad,
      status: ad.status as AdStatus,
      versions,
      platforms,
    };
  }

  async findByAdId(adId: string): Promise<AdWithRelations | null> {
    const query = `
      SELECT id, ad_id, status, start_date, end_date,
             page_name, page_profile_uri, created_at, updated_at
      FROM ads
      WHERE ad_id = $1
    `;

    const ad = await this.db.queryOne<Ad>(query, [adId]);
    if (!ad) return null;

    const [versions, platforms] = await Promise.all([
      this.getVersionsByAdId(ad.id),
      this.getPlatformsByAdId(ad.id),
    ]);

    return {
      ...ad,
      status: ad.status as AdStatus,
      versions,
      platforms,
    };
  }

  async count(filters?: AdFilters): Promise<number> {
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      whereConditions.push(`status = $${paramIndex}`);
      queryParams.push(filters.status);
      paramIndex++;
    }

    if (filters?.startDate) {
      whereConditions.push(`start_date >= $${paramIndex}`);
      queryParams.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      whereConditions.push(`end_date <= $${paramIndex}`);
      queryParams.push(filters.endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const query = `SELECT COUNT(*) as total FROM ads ${whereClause}`;
    const result = await this.db.queryOne<{ total: string }>(query, queryParams);
    return parseInt(result?.total || "0", 10);
  }

  async getAdsByDate(
    filters?: AdFilters
  ): Promise<Array<{ date: string; count: number; active: number; inactive: number }>> {
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (filters?.platform) {
      whereConditions.push(`a.id IN (
        SELECT ad_id FROM ad_platforms WHERE platform = $${paramIndex}
      )`);
      queryParams.push(filters.platform);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const query = `
      SELECT
        DATE(start_date) as date,
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE status = 'ACTIVE') as active,
        COUNT(*) FILTER (WHERE status = 'INACTIVE') as inactive
      FROM ads a
      ${whereClause}
      GROUP BY DATE(start_date)
      ORDER BY date ASC
    `;

    const results = await this.db.query<{
      date: Date;
      count: string;
      active: string;
      inactive: string;
    }>(query, queryParams);

    return results.map((row) => ({
      date: row.date.toISOString().split("T")[0],
      count: parseInt(row.count, 10),
      active: parseInt(row.active, 10),
      inactive: parseInt(row.inactive, 10),
    }));
  }

  async getPlatformStats(
    filters?: AdFilters
  ): Promise<Array<{ platform: string; count: number }>> {
    const whereConditions: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      whereConditions.push(`a.status = $${paramIndex}`);
      queryParams.push(filters.status);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(" AND ")}` : "";

    const query = `
      SELECT
        ap.platform,
        COUNT(DISTINCT ap.ad_id) as count
      FROM ad_platforms ap
      INNER JOIN ads a ON ap.ad_id = a.id
      ${whereClause}
      GROUP BY ap.platform
      ORDER BY count DESC
    `;

    const results = await this.db.query<{ platform: string; count: string }>(query, queryParams);

    return results.map((row) => ({
      platform: row.platform,
      count: parseInt(row.count, 10),
    }));
  }

  private async getVersionsByAdId(adId: string): Promise<AdVersion[]> {
    const query = `
      SELECT id, ad_id, version_number, ad_copy, title,
             image_url, video_url, asset_type, link_url,
             link_description, cta_text, cta_type, caption, created_at
      FROM ad_versions
      WHERE ad_id = $1
      ORDER BY version_number ASC
    `;

    const versions = await this.db.query<AdVersion>(query, [adId]);
    return versions.map((v) => ({
      ...v,
      asset_type: v.asset_type ? (v.asset_type as AssetType) : null,
    }));
  }

  private async getPlatformsByAdId(adId: string): Promise<AdPlatform[]> {
    const query = `
      SELECT id, ad_id, platform, created_at
      FROM ad_platforms
      WHERE ad_id = $1
      ORDER BY platform ASC
    `;

    return await this.db.query<AdPlatform>(query, [adId]);
  }
}
