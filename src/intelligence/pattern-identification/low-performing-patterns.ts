import { makeOpenAIRequestWithStringOutput } from "../../api/genai/openai.api";
import { MetaAdMetricsWithImages } from "../../models/MetaAd";
import { metaBottomPerformingAdsByRevenue } from "../../utils/ad-performance-identification";
import { generateMetaAdsImageDataPrompt } from "../../utils/meta-ads-to-prompt";

const system_prompt = `You are an expert Meta Ads Creative Strategist with deep expertise in visual creative analysis, discount strategy optimization, ROAS improvement, and customer psychology. Your task is to analyze the static ad creative and find comman patterns in these.`;
const user_prompt = `You are an expert Meta Ads Creative Strategist with deep expertise in:
You are given these low-performing static ads to analyze and find common patterns in them.
You need to identify the common patterns in these low-performing static ads.
Divide the low-performing static ads into groups based on the common patterns you identify.
Somethings to check for are the heading, CTA, physological triggers, visuals, offers etc.
For each pattern, provide proper examples from the images given to back up your analysis.`;

export async function findPatternInLowPerformingStaticAds(metaAds: MetaAdMetricsWithImages[]): Promise<string> {
  let lowPerformingMetaAds = metaBottomPerformingAdsByRevenue(metaAds);
  const prompt_images = generateMetaAdsImageDataPrompt(lowPerformingMetaAds);
  prompt_images.push({ type: "text", text: user_prompt });

  const messages = [
    { role: "system", content: system_prompt },
    { role: "user", content: prompt_images },
  ];
  return await makeOpenAIRequestWithStringOutput({
    messages: messages,
  });
}
