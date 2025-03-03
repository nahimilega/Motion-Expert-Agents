import { AzureOpenAI } from "openai";
import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";
import "@azure/openai/types";
import * as dotenv from "dotenv";

dotenv.config();

// Type definitions
interface OpenAIRequestOptions {
  messages: ChatCompletionMessageParam[]; // Required parameter
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string | string[] | null;
  tools?: any[]; // Using any for tools as the exact type depends on OpenAI's API
  toolChoice?: any; // Using any for toolChoice for the same reason
}

/**
 * Base function to make OpenAI API calls without retry logic
 * @param options - Configuration options
 * @returns Promise with the OpenAI API response
 */
export async function makeOpenAIRequest(options: OpenAIRequestOptions): Promise<ChatCompletion> {
  // Configuration settings with defaults
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "https://fuego-ai-main.openai.azure.com/";
  const apiKey = process.env.OPENAI_API_KEY;
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-07-01-preview";
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || "gpt-4oNew";

  // Validate required config
  if (!apiKey) {
    throw new Error("OpenAI API key is required. Set OPENAI_API_KEY environment variable.");
  }

  // Initialize client
  const client = new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment,
  });

  // Default request parameters
  const {
    messages, // Required parameter, no default
    model = "", // Empty string means use deployment as model
    maxTokens = 800,
    temperature = 0.7,
    topP = 0.95,
    frequencyPenalty = 0,
    presencePenalty = 0,
    stop = null,
    tools = undefined,
    toolChoice = undefined,
  } = options;

  try {
    // Format the request parameters to match the OpenAI API
    const requestParams: Record<string, any> = {
      model: model,
      messages: messages,
      max_tokens: maxTokens,
      temperature: temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      stop: stop,
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

/**
 * Helper function to sleep for specified milliseconds
 * @param ms - Milliseconds to sleep
 */
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
function validateFunctionCall(response: ChatCompletion, tools?: any[]): boolean {
  try {
    // Check if tools were specified but no tool calls were returned
    const responseMessage = response.choices[0].message;

    if (!tools) {
      // If no tools were specified, no validation needed
      return true;
    }

    if (!responseMessage.tool_calls || responseMessage.tool_calls.length === 0) {
      return false;
    }

    // Try to parse the arguments JSON
    const functionArgs = responseMessage.tool_calls[0].function.arguments;

    try {
      JSON.parse(functionArgs);
      return true;
    } catch (parseError) {
      console.error("Error parsing function arguments:", parseError);
      return false;
    }
  } catch (error) {
    console.error("Error validating function call:", error);
    return false;
  }
}

/**
 * Makes an OpenAI API call with function calling support and validation, with retry logic
 * @param options - Configuration options (same as makeOpenAIRequest)
 * @param maxRetries - Maximum number of retry attempts
 * @param retryDelay - Delay between retries in ms
 * @param doValidateFunctionCall - Whether to validate function calls
 * @returns Promise with the validated OpenAI API response
 */
export async function makeOpenAIRequestWithFunctionCallValidation(options: OpenAIRequestOptions, maxRetries: number = 3, retryDelay: number = 2000, doValidateFunctionCall: boolean = true): Promise<ChatCompletion> {
  let attempts = 0;
  let lastError: Error | null = null;

  while (attempts < maxRetries) {
    try {
      const response = await makeOpenAIRequest(options);

      // Validate the response if requested
      if (doValidateFunctionCall) {
        const isValid = validateFunctionCall(response, options.tools);
        if (!isValid) {
          throw new Error("Function call validation failed");
        }
      }

      return response;
    } catch (error) {
      attempts++;
      lastError = error instanceof Error ? error : new Error(String(error));

      console.error(`Attempt ${attempts}/${maxRetries} failed: ${lastError.message}`);

      // If we've reached max retries, throw the error
      if (attempts >= maxRetries) {
        break;
      }

      // Wait before retrying
      await sleep(retryDelay);
    }
  }

  // If we've exhausted all retries, throw a descriptive error
  throw new Error(`Failed after ${maxRetries} attempts: ${lastError?.message || "Unknown error"}`);
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
      const toolsResult = await makeOpenAIRequestWithFunctionCallValidation({
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
