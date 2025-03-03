import { MetaAdMetrics } from "../models/MetaAd";

/**
 * Identifies the top performing Meta ads based on revenue
 * @param metaAds - Array of Meta ad metrics to analyze
 * @param percentile - Percentage of top performing ads to consider (default: 0.2 or 20%)
 * @param limit - Maximum number of ads to return (default: 30)
 * @returns Array of top performing Meta ads, sorted by revenue in descending order
 */
export function metaTopPerformingAdsByRevenue(metaAds: MetaAdMetrics[], percentile: number = 0.2, limit = 30): MetaAdMetrics[] {
  const sortedAds = metaAds.sort((a, b) => b.revenue - a.revenue);
  const topAds = sortedAds.slice(0, Math.floor(percentile * metaAds.length));
  return topAds.slice(0, limit);
}

export function metaBottomPerformingAdsByRevenue(metaAds: MetaAdMetrics[], percentile: number = 0.2, limit = 30): MetaAdMetrics[] {
  const sortedAds = metaAds.sort((a, b) => a.revenue - b.revenue);
  const bottomAds = sortedAds.slice(0, Math.floor(percentile * metaAds.length));
  return bottomAds.slice(0, limit);
}
