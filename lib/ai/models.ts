import {
  customProvider,
  extractReasoningMiddleware,
  type LanguageModel,
  wrapLanguageModel,
} from "ai";
import { createOllama } from "ollama-ai-provider";

export const DEFAULT_CHAT_MODEL: string = "chat-model-reasoning";

const ollama = createOllama({
  baseURL: "https://meme.marshub.life/api",
});

export const model = <LanguageModel>ollama("hf.co/kllalio/gguf16q4-instruct:latest");

// const togetherai = createTogetherAI({
//   apiKey: process.env.TOGETHER_AI_API_KEY ?? "",
// });

// export const togetherModel = togetherai(
//   "deepseek-ai/DeepSeek-R1-Distill-Llama-70B-free"
// );

export const myProvider = customProvider({
  languageModels: {
    // 'chat-model-small': openai('gpt-4o-mini'),
    // 'chat-model-large': openai('gpt-4o'),
    "chat-model-reasoning": wrapLanguageModel({
      model,
      middleware: extractReasoningMiddleware({ tagName: "think" }),
    }),
    "title-model": model,
    "block-model": model,
  },
  // imageModels: {
  //   'small-model': togetherai.image('meta-llama/Llama-Vision-Free'),
  //   'large-model': togetherai.image('meta-llama/Llama-Vision-Free'),
  // },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  // {
  //   id: 'chat-model-small',
  //   name: 'Small model',
  //   description: 'Small model for fast, lightweight tasks',
  // },
  // {
  //   id: 'chat-model-large',
  //   name: 'Large model',
  //   description: 'Large model for complex, multi-step tasks',
  // },
  {
    id: "chat-model-reasoning",
    name: "Reasoning model",
    description: "Uses advanced reasoning",
  },
];
