import { MetaPerformanceWithImageService } from "../../data/meta/meta-performance-with-image.service";
import { WorkflowPipelineContext, WorkflowStep } from "../workflow-step";

export class FetchMetaAdsWithImage extends WorkflowStep {
  metaPerformanceService = new MetaPerformanceWithImageService();
  outputKey: string = "metaAds";
  constructor() {
    super("Fetch Meta Ads", ["metaAccountId", "metaAccessToken"]);
  }

  async execute(context: WorkflowPipelineContext): Promise<WorkflowPipelineContext> {
    const results = await this.metaPerformanceService.getActiveAdsAdsWithImages(context["metaAccountId"], context["metaAccessToken"]);
    const adsWithImages = [];
    for (const ad of results) {
      if (ad.image_urls.length > 0) {
        adsWithImages.push(ad);
      }
    }
    return {
      ...context,
      [this.outputKey]: adsWithImages,
    };
  }
}
