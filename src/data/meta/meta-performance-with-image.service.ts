import { MetaAdMetricsWithImages } from "../../models/MetaAd";
import { MetaApiClient } from "../../api/meta/meta-api";
import { MetaPerformanceService } from "./meta-performance.sevice";

// Extend the existing interface with image URLs

export class MetaPerformanceWithImageService {
  private readonly apiClient: MetaApiClient;
  private readonly performanceService: MetaPerformanceService;
  private imageCache: Map<string, string> = new Map();

  constructor() {
    this.apiClient = new MetaApiClient();
    this.performanceService = new MetaPerformanceService();
  }

  /**
   * Get ad metrics enhanced with image URLs
   *
   * Logic:
   * 1. Get all base ad metrics from performanceService
   * 2. Process each ad individually (not in batch)
   * 3. For each ad, try to fetch image URLs for its hashes
   * 4. If API call fails for an ad, skip it completely and move to next ad
   * 5. Return only the ads that were successfully processed
   */
  async getActiveAdsAdsWithImages(accountId: string, accessToken: string): Promise<MetaAdMetricsWithImages[]> {
    const adMetrics = await this.performanceService.getActiveAds(accountId, accessToken);
    const result: MetaAdMetricsWithImages[] = [];

    for (const ad of adMetrics) {
      try {
        const imageUrls: string[] = [];

        for (const hash of ad.image_hashs) {
          try {
            let url: string;
            if (this.imageCache.has(hash)) {
              url = this.imageCache.get(hash)!;
            } else {
              url = await this.fetchImageUrl(accountId, accessToken, hash);
              this.imageCache.set(hash, url);
            }
            imageUrls.push(url);
          } catch (error) {
            console.error(`Error processing ad ${ad.ad_id}: ${error}. Skipping this ad entirely.`);
          }
        }

        // Add successfully processed ad to results
        result.push({
          ...ad,
          image_urls: imageUrls,
        });
      } catch (error) {
        console.error(`Error processing ad ${ad.ad_id}: ${error}. Skipping this ad entirely.`);
      }
    }

    return result;
  }

  private buildImageFetchingApiEndpoint(accountId: string): string {
    return `/${accountId}/adimages`;
  }

  private buildImageFetchingApiParams(accessToken: string, image_hash: string): Record<string, any> {
    return {
      fields: JSON.stringify(["id", "permalink_url", "hash"]),
      access_token: accessToken,
      hashes: JSON.stringify([image_hash]),
      limit: 10,
    };
  }

  /**
   * Fetch a single image URL by hash
   * @private
   */
  async fetchImageUrl(accountId: string, accessToken: string, hash: string): Promise<string> {
    try {
      // Call Meta API to get this specific image URL
      const endpoint = this.buildImageFetchingApiEndpoint(accountId);
      const params = this.buildImageFetchingApiParams(accessToken, hash);

      const response = await this.apiClient.fetchData(endpoint, params);
      if (response.data.data && response.data.data.length > 0) {
        return response.data.data[0].permalink_url;
      }

      throw new Error(`Failed to get URL for image hash: ${hash}`);
    } catch (error) {
      // Propagate error to caller so the entire ad can be skipped
      throw new Error(`Error fetching image URL for hash ${hash}: ${error}`);
    }
  }

  /**
   * Clear the image URL cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }
}
