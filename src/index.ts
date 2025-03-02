// Example TypeScript Node.js application

import { makeOpenAICall } from "./services/genai-service/openai.service";
import { MetaApiClient } from "./services/meta-service/meta-api.client";
import { MetaPerformanceWithImageService } from "./services/meta-service/meta-performance-with-image.service";
import { MetaPerformanceService } from "./services/meta-service/meta-performance.sevice";

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
    await makeOpenAICall();
    1 / 0;
    const results = await metaPerformanceService.getLastNDaysAdsWithImages(account_id, access_token);
    console.log("Fetched Meta API Results:", JSON.stringify(results, null, 2));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
main().catch(console.error);
console.log("TypeScript Node.js application started!");
