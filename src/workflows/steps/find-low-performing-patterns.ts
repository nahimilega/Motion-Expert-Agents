import { MetaPerformanceWithImageService } from "../../data/meta/meta-performance-with-image.service";
import { findPatternInLowPerformingStaticAds } from "../../intelligence/pattern-identification/low-performing-patterns";
import { WorkflowPipelineContext, WorkflowStep } from "../workflow-step";

export class FindStaticLowPerformingPattern extends WorkflowStep {
  outputKey: string = "lowPerformingPatterns";
  constructor() {
    super("Fetch Meta Ads", ["metaAds"]);
  }
  async validate(context: WorkflowPipelineContext): Promise<void> {
    await super.validate(context);
    if (context["metaAds"].length < 5) {
      throw new Error(`metaAds too less for step '${this.name}': ${context["metaAds"].length}`);
    }
  }

  async execute(context: WorkflowPipelineContext): Promise<WorkflowPipelineContext> {
    const results = await findPatternInLowPerformingStaticAds(context["metaAds"]);
    return {
      ...context,
      [this.outputKey]: results,
    };
  }
}
