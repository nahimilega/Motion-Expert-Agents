import { WorkflowPipelineContext, WorkflowStep } from "./workflow-step";

class WorkflowPipeline {
  private steps: WorkflowStep[] = [];

  addTask(step: WorkflowStep): WorkflowPipeline {
    this.steps.push(step);
    return this;
  }

  async execute(initialContext: WorkflowPipeline): Promise<WorkflowPipelineContext> {
    let context: WorkflowPipelineContext = { ...initialContext };

    for (const step of this.steps) {
      await step.validate(context);
      context = await step.execute(context);
    }

    return context; // Return final context with all results
  }
}
