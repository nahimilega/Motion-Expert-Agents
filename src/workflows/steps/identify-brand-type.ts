import { WorkflowPipelineContext, WorkflowStep } from "../workflow-step";

// Task 3: Identify Brand Type
class IdentifyBrandTypeStep extends WorkflowStep {
  constructor() {
    super("Identify Brand Type", ["ads"]);
  }

  async execute(context: WorkflowPipelineContext): Promise<WorkflowPipelineContext> {
    // Return updated context
    let brandType = {
      brandType: "tech",
    };
    return {
      ...context,
      brandType,
    };
  }
}
