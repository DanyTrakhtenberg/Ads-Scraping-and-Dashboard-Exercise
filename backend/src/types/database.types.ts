/**
 * Database row types (raw database results)
 */

export interface AdRow {
  id: string;
  ad_id: string;
  status: string;
  start_date: Date;
  end_date: Date | null;
  page_name: string;
  page_profile_uri: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AdVersionRow {
  id: string;
  ad_id: string;
  version_number: number;
  ad_copy: string | null;
  title: string | null;
  image_url: string | null;
  video_url: string | null;
  asset_type: string | null;
  link_url: string | null;
  link_description: string | null;
  cta_text: string | null;
  cta_type: string | null;
  caption: string | null;
  created_at: Date;
}

export interface AdPlatformRow {
  id: string;
  ad_id: string;
  platform: string;
  created_at: Date;
}
