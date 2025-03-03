import { WorkflowPipelineContext, WorkflowStep } from "../workflow-step";

export class IdentifyBrandType extends WorkflowStep {
  outputKey: string = "brandType";
  constructor() {
    super("Identify Brand Type", ["metaAds"]);
  }

  async execute(context: WorkflowPipelineContext): Promise<WorkflowPipelineContext> {
    return {
      ...context,
      [this.outputKey]: "brandType",
    };
  }
}
