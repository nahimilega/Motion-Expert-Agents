import { makeOpenAIRequestWithFunctionCall, makeOpenAIRequestWithStringOutput } from "../../api/genai/openai.api";

const system_prompt = `You are an expert Meta Ads Creative Strategist with deep expertise in visual creative analysis, discount strategy optimization, ROAS improvement, and customer psychology. Your task is to analyze the static ad creative and find comman patterns in these.
`;
const user_prompt = `You are an expert Meta Ads Creative Strategist with deep expertise in:
You are given these high-performing static ads to analyze and find common patterns in them.
You need to identify the common patterns in these high-performing static ads and provide insights to the creative team to improve the performance of the low-performing static ads.
Divide the high-performing static ads into groups based on the common patterns you identify
`;

function generateWhatsWorkingWhatsNotPrompt(highPerformingPatterns: string, lowPerformingPatterns: string, externalKnowledge?: string) {
  const messages = [
    { role: "system", content: system_prompt },
    { role: "user", content: user_prompt },
  ];
  return messages;
}

export function findWhatsWorkingWhatsNotRecommendation(highPerformingPatterns: string, lowPerformingPatterns: string, externalKnowledge?: string): Promise<string> {
  const messages = generateWhatsWorkingWhatsNotPrompt(highPerformingPatterns, lowPerformingPatterns, externalKnowledge);
  return makeOpenAIRequestWithStringOutput({
    messages: messages,
    maxTokens: 1000,
  });
}

export async function findWhatsWorkingWhatsNotRecommendationJson(highPerformingPatterns: string, lowPerformingPatterns: string, externalKnowledge?: string): Promise<JSON> {
  const recommendationString: string = await findWhatsWorkingWhatsNotRecommendation(highPerformingPatterns, lowPerformingPatterns, externalKnowledge);

  const messages = generateWhatsWorkingWhatsNotPrompt(highPerformingPatterns, lowPerformingPatterns, externalKnowledge);
  messages.push({ role: "system", content: recommendationString });
  messages.push({ role: "user", content: "What do you" });

  return await makeOpenAIRequestWithFunctionCall({
    messages: messages,
    maxTokens: 1000,
  });
}
