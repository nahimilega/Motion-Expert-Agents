import { MetaAdMetricsWithImages } from "../../models/MetaAd";
import { metaTopPerformingAdsByRevenue } from "../../utils/ad-performance-identification";

export function findPatternInLowPerformingStaticAds(metaAds: MetaAdMetricsWithImages[]): string {
  let highPerformingMetaAds = metaTopPerformingAdsByRevenue(metaAds);
  return "";
}
