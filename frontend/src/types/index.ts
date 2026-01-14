/**
 * Frontend types matching the backend API
 */

export const AdStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;

export type AdStatus = typeof AdStatus[keyof typeof AdStatus];

export const AssetType = {
  IMAGE: "image",
  VIDEO: "video",
} as const;

export type AssetType = typeof AssetType[keyof typeof AssetType];

export interface Ad {
  id: string;
  ad_id: string;
  status: AdStatus;
  start_date: string;
  end_date: string | null;
  page_name: string;
  page_profile_uri: string | null;
  created_at: string;
  updated_at: string;
  versions?: AdVersion[];
  platforms?: AdPlatform[];
}

export interface AdVersion {
  id: string;
  ad_id: string;
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
  created_at: string;
}

export interface AdPlatform {
  id: string;
  ad_id: string;
  platform: string;
  created_at: string;
}

export interface AdWithRelations extends Ad {
  versions: AdVersion[];
  platforms: AdPlatform[];
}

export interface AdFilters {
  status?: AdStatus;
  platform?: string;
  startDate?: string;
  endDate?: string;
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

export interface Stats {
  total: number;
  active: number;
  inactive: number;
  byDate: Array<{
    date: string;
    count: number;
    active: number;
    inactive: number;
  }>;
  byPlatform: Array<{
    platform: string;
    count: number;
  }>;
}
