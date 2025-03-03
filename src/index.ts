import { FetchMetaAdsWithImage } from "./workflows/steps/fetch-meta-ads";
import { FindStaticHighPerformingPattern } from "./workflows/steps/find-high-performing-patterns";
import { FindStaticLowPerformingPattern } from "./workflows/steps/find-low-performing-patterns";
import { GenerateRecommendations } from "./workflows/steps/get-recommendation";
import { IdentifyBrandType } from "./workflows/steps/identify-brand-type";
import { WorkflowPipeline } from "./workflows/workflow-pipeline";
import { WorkflowPipelineContext } from "./workflows/workflow-step";

const pipeline = new WorkflowPipeline();

pipeline.addTask(new FetchMetaAdsWithImage()).addTask(new IdentifyBrandType()).addTask(new FindStaticHighPerformingPattern()).addTask(new FindStaticLowPerformingPattern()).addTask(new GenerateRecommendations());

const context: WorkflowPipelineContext = {
  metaAccessToken: "<Access Token>",
  metaAccountId: "<Account ID>",
  creatorName: "dara_denney",
};

pipeline.execute(context).then((result) => {
  console.log("Pipeline result:", result);
});
