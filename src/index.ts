// Example TypeScript Node.js application

import { makeOpenAIRequestWithFunctionCall, makeOpenAIRequestWithStringOutput } from "./api/genai/openai.api";
import { MetaApiClient } from "./api/meta/meta-api";
import { MetaPerformanceWithImageService } from "./data/meta/meta-performance-with-image.service";
import { MetaPerformanceService } from "./data/meta/meta-performance.sevice";
import { findPatternInHighPerformingStaticAds } from "./intelligence/pattern-identification/high-performing-patterns";

interface User {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

// const metaService = new MetaApiClient();

// const access_token = "EAACKYfAW95EBO0MPdKHskVVflZCry36jupsBzqZA8UvuKp8tOrTojRheg8HmhOB7YDAYfwH62jDLashsxeUPGHEKyP90lBKZC5IBWY9BFUjP8mRRJR7HpYR7fTCPSWAZB5FMYOOXkOWfYSmDVSqOcClD09PY32tTuh4aNXoRUWyUjwDZB4ZC8X3d05";
// const account_id = "act_734914004580988";

// let endpoint = "/" + account_id + "/ads";

// let after = "";

// const params: any = {
//   fields: JSON.stringify(["name", "status", "effective_status", "id"]),
//   access_token: access_token,
//   limit: 80,
//   after: after,
// };

// params.filtering = JSON.stringify([
//   {
//     field: "effective_status",
//     operator: "IN",
//     value: ["ACTIVE"],
//   },
// ]);
// Replace the last two lines with:
const access_token = "EAACKYfAW95EBO0MPdKHskVVflZCry36jupsBzqZA8UvuKp8tOrTojRheg8HmhOB7YDAYfwH62jDLashsxeUPGHEKyP90lBKZC5IBWY9BFUjP8mRRJR7HpYR7fTCPSWAZB5FMYOOXkOWfYSmDVSqOcClD09PY32tTuh4aNXoRUWyUjwDZB4ZC8X3d05";
const account_id = "act_734914004580988";

const metaPerformanceService = new MetaPerformanceWithImageService();
async function main() {
  try {
    // const aaa = await makeOpenAIRequestWithStringOutput({
    //   messages: [
    //     { role: "system", content: "You are a helpful assistant." },
    //     { role: "user", content: "Tell me about Node.js" },
    //   ],
    // });

    const toolsResult = await makeOpenAIRequestWithFunctionCall({
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "What's the weather in New York?" },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "getWeather",
            description: "Get the current weather in a location",
            parameters: {
              type: "object",
              properties: {
                location: {
                  type: "string",
                  description: "The city and state, e.g. San Francisco, CA",
                },
              },
              required: ["location"],
            },
          },
        },
      ],
      toolChoice: "auto",
    });

    console.log("OpenAI result:", toolsResult);
    1 / 0;
    const results = await metaPerformanceService.getLastNDaysAdsWithImages(account_id, access_token);
    console.log("Fetched Meta API Results:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

async function example() {
  const results = await metaPerformanceService.getLastNDaysAdsWithImages(account_id, access_token);
  //  Filter out only image ads
  const filtered_ads = [];
  for (const ad of results) {
    if (ad.image_urls.length > 0) {
      filtered_ads.push(ad);
    }
  }
  console.log("Filtered Ads:", filtered_ads.length);
  console.log(await findPatternInHighPerformingStaticAds(filtered_ads));
}
example().catch(console.error);
// main().catch(console.error);
console.log("TypeScript Node.js application started!");
