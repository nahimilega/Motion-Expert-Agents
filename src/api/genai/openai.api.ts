import { AzureOpenAI } from "openai";
import { ChatCompletion, ChatCompletionCreateParamsNonStreaming, ChatCompletionMessageParam } from "openai/resources";
import "@azure/openai/types";
import * as dotenv from "dotenv";

dotenv.config();

interface OpenAIRequestOptions {
  messages: any[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[] | null;
  tools?: any[];
  toolChoice?: any;
}

/**
 * Base function to make OpenAI API calls without retry logic
 * @param options - Configuration options
 * @returns Promise with the OpenAI API response
 */
async function makeOpenAIRequest(options: OpenAIRequestOptions): Promise<ChatCompletion> {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://fuego-ai-main.openai.azure.com/";
  const apiKey = process.env.OPENAI_API_KEY;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-07-01-preview";
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4oNew";

  if (!apiKey) {
    throw new Error("OpenAI API key is required. Set OPENAI_API_KEY environment variable.");
  }

  const client = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment,
  });

  const { messages, model = "", maxTokens = 800, temperature = 0, frequencyPenalty = 0, presencePenalty = 0, tools = undefined, toolChoice = undefined } = options;

  try {
    // Format the request parameters to match the OpenAI API
    const requestParams: ChatCompletionCreateParamsNonStreaming = {
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
    };

    // Add optional parameters if provided
    if (tools) {
      requestParams.tools = tools;
    }

    if (toolChoice) {
      requestParams.tool_choice = toolChoice;
    }

    const response = await client.chat.completions.create(requestParams);
    return response;
  } catch (error) {
    // Just throw the error without retry
    const errorMessage = `Error in calling AI Model: ${error instanceof Error ? error.message : String(error)}`;
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Makes an OpenAI API call that returns just the content string, with retry logic
 * @param options - Configuration options (same as makeOpenAIRequest)
 * @param maxRetries - Maximum number of retry attempts
 * @param retryDelay - Delay between retries in ms
 * @returns Promise with the content string from the response
 */
export async function makeOpenAIRequestWithStringOutput(options: OpenAIRequestOptions, maxRetries: number = 3, retryDelay: number = 2000): Promise<string> {
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < maxRetries) {
    try {
      const response = await makeOpenAIRequest(options);
      const content = response.choices[0].message.content;

      if (content) {
        return content;
      }
      throw new Error("Empty content in AI response");
    } catch (error) {
      attempts++;
      lastError = error instanceof Error ? error : new Error(String(error));

      console.error(`Attempt ${attempts}/${maxRetries} failed: ${lastError.message}`);

      if (attempts >= maxRetries) {
        break;
      }

      await sleep(retryDelay);
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`);
}

/**
 * Validates function call responses from OpenAI
 * @param response - The OpenAI API response
 * @param tools - The tools configuration
 * @returns Whether the function call is valid
 */
function parseFunctionCall(response: ChatCompletion): any {
  const responseMessage = response.choices[0].message;

  if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
    throw new Error("No tool calls found in response");
  }
  const functionArgs = responseMessage.tool_calls[0].function.arguments;
  return JSON.parse(functionArgs);
}

/**
 * Makes an OpenAI API call with function calling support and validation, with retry logic
 * @param options - Configuration options (same as makeOpenAIRequest)
 * @param maxRetries - Maximum number of retry attempts
 * @param retryDelay - Delay between retries in ms
 * @param doValidateFunctionCall - Whether to validate function calls
 * @returns Promise with the validated OpenAI API response
 */
export async function makeOpenAIRequestWithFunctionCall(options: OpenAIRequestOptions, maxRetries: number = 3, retryDelay: number = 2000): Promise<any> {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      const response = await makeOpenAIRequest(options);
      return parseFunctionCall(response);
    } catch (error) {
      attempts++;
      console.error(`Attempt ${attempts}/${maxRetries} failed: ${error instanceof Error ? error.message : String(error)}`);

      if (attempts >= maxRetries) {
        break;
      }

      await sleep(retryDelay);
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts:  || "Unknown error"}`);
}

/**
 * Example usage
 */
async function example(): Promise<void> {
  try {
    // Example 1: Basic request with no retry (might fail)
    try {
      const basicResult = await makeOpenAIRequest({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "Tell me about Node.js" },
        ],
      });
      console.log("Basic result:", JSON.stringify(basicResult, null, 2));
    } catch (error) {
      console.error("Basic request failed:", error instanceof Error ? error.message : String(error));
    }

    // Example 2: Get just the content string with retry
    try {
      const contentOnly = await makeOpenAIRequestWithStringOutput({
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is the capital of France?" },
        ],
        temperature: 0.3,
      });
      console.log("Content only:", contentOnly);
    } catch (error) {
      console.error("String output request failed:", error instanceof Error ? error.message : String(error));
    }

    // Example 3: Function calling with validation and retry
    try {
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
      console.log("Tools result:", JSON.stringify(toolsResult, null, 2));
    } catch (error) {
      console.error("Function call request failed:", error instanceof Error ? error.message : String(error));
    }
  } catch (error) {
    console.error("Example failed:", error instanceof Error ? error.message : String(error));
  }
}
