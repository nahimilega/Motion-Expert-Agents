import { findWhatsWorkingWhatsNotRecommendationJsonWithCreatorContext } from "../../intelligence/recommendation/whatsworking-whatsnot-recommendation";
import { WorkflowPipelineContext, WorkflowStep } from "../workflow-step";

export class GenerateRecommendations extends WorkflowStep {
  outputKey: string = "recommendations";
  constructor() {
    super("Generate What's working what's not", ["lowPerformingPatterns", "highPerformingPatterns", "creatorName", "brandType"]);
  }

  async execute(context: WorkflowPipelineContext): Promise<WorkflowPipelineContext> {
    const results = await findWhatsWorkingWhatsNotRecommendationJsonWithCreatorContext(context["highPerformingPatterns"], context["lowPerformingPatterns"], context["creatorName"], context["brandType"]);
    return {
      ...context,
      [this.outputKey]: results,
    };
  }
}
