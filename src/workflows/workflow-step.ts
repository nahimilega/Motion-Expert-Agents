export interface WorkflowPipelineContext {
  [key: string]: any;
  metadata?: {
    startTime?: Date;
    lastUpdated?: Date;
  };
}

export abstract class WorkflowStep {
  constructor(public readonly name: string, public readonly requiredKeys: string[] = []) {}

  protected async validateRequiredKeys(context: WorkflowPipelineContext): Promise<void> {
    const missingKeys = this.requiredKeys.filter((key) => !(key in context));

    if (missingKeys.length > 0) {
      throw new Error(`Missing required keys in context for step '${this.name}': ${missingKeys.join(", ")}`);
    }
  }

  async validate(context: WorkflowPipelineContext): Promise<void> {
    await this.validateRequiredKeys(context);
  }
  abstract execute(context: WorkflowPipelineContext): Promise<WorkflowPipelineContext>;
}
