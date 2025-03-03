import { FetchMetaAdsWithImage } from "./workflows/steps/fetch-meta-ads";
import { FindStaticHighPerformingPattern } from "./workflows/steps/find-high-performing-patterns";
import { FindStaticLowPerformingPattern } from "./workflows/steps/find-low-performing-patterns";
import { GenerateRecommendations } from "./workflows/steps/get-recommendation";
import { IdentifyBrandType } from "./workflows/steps/identify-brand-type";
import { WorkflowPipeline } from "./workflows/workflow-pipeline";
import { WorkflowPipelineContext } from "./workflows/workflow-step";

// Create the exact workflow from your diagram
const pipeline = new WorkflowPipeline();

const context: WorkflowPipelineContext = {
  metaAccessToken: "EAACKYfAW95EBO0MPdKHskVVflZCry36jupsBzqZA8UvuKp8tOrTojRheg8HmhOB7YDAYfwH62jDLashsxeUPGHEKyP90lBKZC5IBWY9BFUjP8mRRJR7HpYR7fTCPSWAZB5FMYOOXkOWfYSmDVSqOcClD09PY32tTuh4aNXoRUWyUjwDZB4ZC8X3d05",
  metaAccountId: "act_734914004580988",
  creatorName: "dara_denney",
};

pipeline.addTask(new FetchMetaAdsWithImage()).addTask(new IdentifyBrandType()).addTask(new FindStaticHighPerformingPattern()).addTask(new FindStaticLowPerformingPattern()).addTask(new GenerateRecommendations());

pipeline.execute(context).then((result) => {
  console.log("Pipeline result:", result);
});
