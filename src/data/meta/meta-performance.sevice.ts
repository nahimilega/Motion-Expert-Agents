import { MetaApiClient } from "../../api/meta/meta-api";
import { MetaAdMetrics } from "../../models/MetaAd";

export class MetaPerformanceService {
  private readonly metaApiClient: MetaApiClient;

  constructor() {
    this.metaApiClient = new MetaApiClient();
  }

  private buildApiEndpoint(accountId: string): string {
    return `/${accountId}/ads`;
  }

  private buildApiParams(accessToken: string): Record<string, any> {
    return {
      fields: JSON.stringify(["name", "status", "effective_status", "id", "campaign{name}", "creative{image_url,image_hash,object_type,video_id,asset_feed_spec,object_story_spec}", "insights.date_preset(maximum){ created_time, spend, campaign_name,purchase_roas,action_values,actions}"]),
      access_token: accessToken,
      limit: 400,
      filtering: JSON.stringify([
        {
          field: "effective_status",
          operator: "IN",
          value: ["ACTIVE"],
        },
      ]),
    };
  }

  async convertResultsToMetaAdMetrics(results: any[]): Promise<MetaAdMetrics[]> {
    return results.map((ad) => this.processAdToMetrics(ad)).filter((metrics): metrics is MetaAdMetrics => metrics !== null);
  }

  /**
   * Process a single ad object into MetaAdMetrics format
   * @param ad - Raw ad object from Meta API
   * @returns Formatted MetaAdMetrics object or null if ad can't be processed
   */
  private processAdToMetrics(ad: any): MetaAdMetrics | null {
    try {
      if (!ad || !ad.id) {
        console.log("Skipping invalid ad: missing ID");
        return null;
      }

      if (!ad.insights || !ad.insights.data || ad.insights.data.length === 0) {
        console.log(`Skipping ad ${ad.id}: missing insights data`);
        console.log(ad);
        return null;
      }

      const mediaInfo = this.extractMediaInfo(ad);
      const metrics = this.extractMetrics(ad);

      if (!metrics) {
        return null;
      }

      return {
        ad_id: ad.id,
        ad_name: ad.name || "Unnamed Ad",
        campaign_name: ad.campaign?.name || "Unknown Campaign",
        is_active: ad.effective_status === "ACTIVE",
        spend: metrics.spend,
        revenue: metrics.revenue,
        roas: metrics.roas,
        is_carousel: mediaInfo.isCarousel,
        image_hashs: mediaInfo.imageHashs,
        video_hashs: mediaInfo.videoHashs,
      };
    } catch (error) {
      console.error(`Error processing ad ${ad?.id || "unknown"}:`, error);
      return null;
    }
  }

  /**
   * Extract media information (images, videos, carousel status) from ad
   * @param ad - Raw ad object from Meta API
   * @returns Object containing image hashes, video hashes, and carousel status
   */
  private extractMediaInfo(ad: any): { imageHashs: string[]; videoHashs: string[]; isCarousel: boolean } {
    const imageHashs = new Set<string>();
    const videoHashs = new Set<string>();
    let isCarousel = false;

    // Helper function to safely add media IDs to sets
    const addMedia = (id: string | null | undefined, collection: Set<string>) => {
      if (id && typeof id === "string" && id.trim() !== "") {
        collection.add(id);
      }
    };

    // Extract from asset_feed_spec videos
    if (Array.isArray(ad.creative?.asset_feed_spec?.videos)) {
      ad.creative.asset_feed_spec.videos.forEach((video: any) => {
        addMedia(video.video_id, videoHashs);
      });
    }

    // Extract from asset_feed_spec images
    if (Array.isArray(ad.creative?.asset_feed_spec?.images)) {
      ad.creative.asset_feed_spec.images.forEach((image: any) => {
        addMedia(image.hash, imageHashs);
      });
    }

    const childAttachments = ad.creative?.object_story_spec?.link_data?.child_attachments;
    if (Array.isArray(childAttachments) && childAttachments.length > 0) {
      isCarousel = true;
      childAttachments.forEach((attachment) => {
        addMedia(attachment.image_hash, imageHashs);
        addMedia(attachment.video_id, videoHashs);
      });
    }

    addMedia(ad.creative?.object_story_spec?.video_data?.video_id, videoHashs);

    if (ad.creative?.video_id && videoHashs.size === 0) {
      addMedia(ad.creative.video_id, videoHashs);
    }

    // Add image_hash from object_story_spec
    addMedia(ad.creative?.object_story_spec?.link_data?.image_hash, imageHashs);

    return {
      imageHashs: [...imageHashs],
      videoHashs: [...videoHashs],
      isCarousel,
    };
  }

  private extractMetrics(ad: any): { spend: number; revenue: number; roas: number } | null {
    if (!ad.insights?.data?.[0]) {
      return null;
    }

    const insights = ad.insights.data[0];
    const spend = parseFloat(insights.spend) || 0;
    const revenue = this.calculateRevenue(insights.action_values);
    const roas = spend > 0 ? revenue / spend : 0;

    return { spend, revenue, roas };
  }

  /**
   * Calculate revenue from action values
   * @param actionValues - Action values from Meta API
   * @returns Total revenue
   */
  private calculateRevenue(actionValues: any[]): number {
    if (!Array.isArray(actionValues)) {
      return 0;
    }

    const purchaseActionTypes = ["purchase", "offsite_conversion.fb_pixel_purchase"];

    return actionValues.reduce((total, action) => {
      if (purchaseActionTypes.includes(action.action_type)) {
        return total + (parseFloat(action.value) || 0);
      }
      return total;
    }, 0);
  }

  async getActiveAds(accountId: string, accessToken: string): Promise<MetaAdMetrics[]> {
    var apiParms = this.buildApiParams(accessToken);
    var apiEndpoint: string = this.buildApiEndpoint(accountId);
    const results = await this.metaApiClient.fetchPaginatedData(apiEndpoint, apiParms);
    return await this.convertResultsToMetaAdMetrics(results.items);
  }
}
