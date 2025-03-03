import { findWhatsWorkingWhatsNotRecommendationJson } from "../../intelligence/recommendation/whatsworking-whatsnot-recommendation";
import { WorkflowPipelineContext, WorkflowStep } from "../workflow-step";

export class GenerateRecommendations extends WorkflowStep {
  outputKey: string = "recommendations";
  constructor() {
    super("Generate What's working what's not", ["lowPerformingPatterns", "highPerformingPatterns"]);
  }

  async execute(context: WorkflowPipelineContext): Promise<WorkflowPipelineContext> {
    "externalKnowledge";
    const results = await findWhatsWorkingWhatsNotRecommendationJson(context["highPerformingPatterns"], context["lowPerformingPatterns"]);
    return {
      ...context,
      [this.outputKey]: results,
    };
  }
}
