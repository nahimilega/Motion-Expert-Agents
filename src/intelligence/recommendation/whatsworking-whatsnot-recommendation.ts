import { makeOpenAIRequestWithFunctionCall, makeOpenAIRequestWithStringOutput } from "../../api/genai/openai.api";
import { fetchCreatorData } from "../../data/market-tends/creator-knowledge";

const system_prompt = `You are an expert Meta Ads Creative Strategist with deep expertise in visual creative analysis, discount strategy optimization, ROAS improvement, and customer psychology. You provide detailed insights to creative teams on what's working, what's not working, and what they should do next
`;
const tools = [
  {
    type: "function",
    function: {
      name: "whats_working_whats_not_recommendation",
      description: "Find what's working, what's not working and what should be done next based on high and low performing creative patterns. If you use external knowledge, provide proper creator name as well",
      parameters: {
        type: "object",
        properties: {
          whats_working: {
            type: "array",
            items: { type: "string" },
            description: "What patterns are working. based on the above patterns. Provide them in proper format with justification and examples. Keep it multiline insights. With proper examples and data points to back up your analysis.",
          },
          whats_not_working: {
            type: "array",
            items: { type: "string" },
            description: "What patterns are not working. based on the above patterns. Provide them in proper format with justification and examples. Keep it multiline insights. keep it different from what's working. With proper examples and data points to back up your analysis.",
          },
          recommendations: {
            type: "string",
            description: "Recommendations based on the above insights. Provide them in proper format with justification and examples. Keep it multiline insights. Provide proper examples and data points to back up your analysis. With proper examples and data points to back up your analysis.",
          },
        },
        required: ["whats_working", "whats_not_working", "recommendations"],
      },
    },
  },
];

function generateWhatsWorkingWhatsNotPrompt(highPerformingPatterns: string, lowPerformingPatterns: string, externalKnowledge?: string, externalKnowledgePromptContext?: string): any[] {
  let user_prompt: string = `You are given patterns found in high performing creatives, patterns found in low performaing creatives.
### Patterns in high performing creatives: 
${highPerformingPatterns}

### Patterns in low performing creatives:
${lowPerformingPatterns}`;

  if (externalKnowledge) {
    user_prompt += `
You are also provided some special advice on what works from the expert in this domain
${externalKnowledgePromptContext}
${externalKnowledge}`;
  }
  user_prompt += `Based on this do a thorough analysis of the high performing and low performing creative patterns and provide recommendations on what's working, what's not working and what should be done next.
Write as expert-level analysis in the tone of a McKinsey analyst. Focus only on the most impactful insights. Povide different insights for each pointer
Set tone as human, like Meta expert creative stratagit and McKinsey analyst. Whole point it people trust your insight and implement it... and not just think some generic random advice. Provide objective and actionable insights with proper examples and data points to back up.`;

  const messages = [
    { role: "system", content: system_prompt },
    { role: "user", content: user_prompt },
  ];
  return messages;
}

export function findWhatsWorkingWhatsNotRecommendation(highPerformingPatterns: string, lowPerformingPatterns: string, externalKnowledge?: string, externalKnowledgePromptContext?: string): Promise<string> {
  const messages = generateWhatsWorkingWhatsNotPrompt(highPerformingPatterns, lowPerformingPatterns, externalKnowledge, externalKnowledgePromptContext);
  return makeOpenAIRequestWithStringOutput({
    messages: messages,
    maxTokens: 1000,
  });
}

export async function findWhatsWorkingWhatsNotRecommendationJson(highPerformingPatterns: string, lowPerformingPatterns: string, externalKnowledge?: string, externalKnowledgePromptContext?: string): Promise<JSON> {
  const recommendationString: string = await findWhatsWorkingWhatsNotRecommendation(highPerformingPatterns, lowPerformingPatterns, externalKnowledge);

  const messages = generateWhatsWorkingWhatsNotPrompt(highPerformingPatterns, lowPerformingPatterns, externalKnowledge, externalKnowledgePromptContext);
  messages.push({ role: "system", content: recommendationString });
  messages.push({ role: "user", content: "Provide these in a proper json format. Keep limited to 3-4, focues on overlooked intresting datapoints. Avoid generic insights, Be very specific and actionable." });

  return await makeOpenAIRequestWithFunctionCall({
    messages: messages,
    tools: tools,
    toolChoice: "auto",
    maxTokens: 1000,
  });
}

export async function findWhatsWorkingWhatsNotRecommendationJsonWithCreatorContext(highPerformingPatterns: string, lowPerformingPatterns: string, creatorName: string, brandType: string): Promise<JSON> {
  const externalKnowledge = fetchCreatorData(creatorName, brandType);
  const externalKnowledgePromptContext = `Here are some tips from ${creatorName} on how to improve ad performance for this brand type`;
  return await findWhatsWorkingWhatsNotRecommendationJson(highPerformingPatterns, lowPerformingPatterns, externalKnowledge, externalKnowledgePromptContext);
}
