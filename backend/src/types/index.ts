/**
 * Domain types matching the database schema
 */

export enum AdStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export enum AssetType {
  IMAGE = "image",
  VIDEO = "video",
}

export interface Ad {
  id: string;
  ad_id: string; // Facebook Library ID
  status: AdStatus;
  start_date: Date;
  end_date: Date | null;
  page_name: string;
  page_profile_uri: string | null;
  created_at: Date;
  updated_at: Date;
  versions?: AdVersion[];
  platforms?: AdPlatform[];
}

export interface AdVersion {
  id: string;
  ad_id: string; // Foreign key to Ad.id
  version_number: number;
  ad_copy: string | null;
  title: string | null;
  image_url: string | null;
  video_url: string | null;
  asset_type: AssetType | null;
  link_url: string | null;
  link_description: string | null;
  cta_text: string | null;
  cta_type: string | null;
  caption: string | null;
  created_at: Date;
}

export interface AdPlatform {
  id: string;
  ad_id: string; // Foreign key to Ad.id
  platform: string;
  created_at: Date;
}

export interface AdWithRelations extends Ad {
  versions: AdVersion[];
  platforms: AdPlatform[];
}

/**
 * Query filters
 */
export interface AdFilters {
  status?: AdStatus;
  platform?: string;
  startDate?: Date;
  endDate?: Date;
  pageName?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
