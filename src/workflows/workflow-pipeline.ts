import { WorkflowPipelineContext, WorkflowStep } from "./workflow-step";

export class WorkflowPipeline {
  private steps: WorkflowStep[] = [];

  addTask(step: WorkflowStep): WorkflowPipeline {
    this.steps.push(step);
    return this;
  }

  async execute(initialContext: WorkflowPipelineContext): Promise<WorkflowPipelineContext> {
    let context: WorkflowPipelineContext = { ...initialContext };

    for (const step of this.steps) {
      console.log(`Executing step: ${step.name}`);
      await step.validate(context);
      context = await step.execute(context);
    }

    return context; // Return final context with all results
  }
}
