export interface MetaAdMetrics {
  ad_id: string;
  ad_name: string;
  campaign_name: string;
  is_active: boolean;
  spend: number;
  revenue: number;
  roas: number;
  is_carousel: boolean;
  image_hashs: string[];
  video_hashs: string[];
}

export interface MetaAdMetricsWithImages extends MetaAdMetrics {
  image_urls: string[];
}
