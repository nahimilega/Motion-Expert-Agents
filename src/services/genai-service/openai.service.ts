import { AzureOpenAI } from "openai";
import "@azure/openai/types";
import * as dotenv from "dotenv";

dotenv.config();

export async function makeOpenAICall() {
  // You will need to set these environment variables or edit the following values
  const endpoint = "https://fuego-ai-main.openai.azure.com/";
  const apiKey = process.env.OPENAI_API_KEY;
  const apiVersion = "2024-07-01-preview";
  const deployment = "gpt-4oNew"; // This must match your deployment name

  const client = new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });

  const result = await client.chat.completions.create({
    model: "",
    messages: [{ role: "system", content: "You are an AI assistant that helps people find information." }],
    max_tokens: 800,
    temperature: 0.7,
    top_p: 0.95,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: null,
  });

  console.log(JSON.stringify(result, null, 2));
}
