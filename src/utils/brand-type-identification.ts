import { makeOpenAIRequestWithFunctionCall } from "../api/genai/openai.api";
import { MetaAdMetricsWithImages } from "../models/MetaAd";
import { generateMetaAdsImageDataPrompt } from "./meta-ads-to-prompt";

const system_prompt = `You are an expert Meta Ads Creative Strategist`;
const user_prompt = `Based on these ad creative you are given, you need to identify the brand type of the ad creative. Provide the data in proper JSON format following the enum values of the BrandType enum.`;
const tools = [
  {
    type: "function",
    function: {
      name: "predict_brand_type",
      description: "Find the type of brand by the meta ad creative",
      parameters: {
        type: "object",
        properties: {
          brand_type: {
            type: "string",
            enum: ["beauty", "shoes", "fitness", "fmcg", "apparel", "electronics", "food", "jewelry", "home", "other"],
            description: "Type of brand",
          },
        },
        required: ["brand_type"],
      },
    },
  },
];
export async function findBrandTypeByAdImage(metaAds: MetaAdMetricsWithImages[]): Promise<string> {
  const prompt_images = generateMetaAdsImageDataPrompt(metaAds.slice(0, 10));
  prompt_images.push({ type: "text", text: user_prompt });
  const messages = [
    { role: "system", content: system_prompt },
    { role: "user", content: prompt_images },
  ];
  const result = await makeOpenAIRequestWithFunctionCall({
    messages: messages,
    tools: tools,
    toolChoice: "auto",
  });
  console.log("Brand Type Identification Result:", result.brand_type.toLowerCase());
  return result.brand_type.toLowerCase();
}
