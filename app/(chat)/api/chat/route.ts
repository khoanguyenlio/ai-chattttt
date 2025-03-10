import {
  type LanguageModel,
  type Message,
  createDataStreamResponse,
  smoothStream,
  streamText,
} from "ai";

import { auth } from "@/app/(auth)/auth";
import { model } from "@/lib/ai/models";
import { systemPrompt } from "@/lib/ai/prompts";
import {
  deleteChatById,
  getChatById,
  getCommandMessagesByChatId,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from "@/lib/utils";

import { handleCommands } from "@/lib/utils/commands";
import { generateTitleFromUserMessage } from "../../actions";

export const maxDuration = 60;

export async function POST(request: Request) {
  const {
    id,
    messages,
    selectedChatModel,
  }: { id: string; messages: Array<Message>; selectedChatModel: string } =
    await request.json();

  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userMessage = getMostRecentUserMessage(messages);

  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const commandResult = await handleCommands(userMessage.content);

  if (commandResult) {
    try {
      const chat = await getChatById({ id });

      if (!chat) {
        const title = `Command: ${userMessage.content.slice(0, 50)}`;
        await saveChat({ id, userId: session.user.id, title });
      }

      const assistantMessageId = generateUUID();

      const messages: any = [
        {
          ...userMessage,
          createdAt: new Date(),
          chatId: id,
          isCommand: true,
        },
        {
          id: assistantMessageId,
          role: "assistant",
          content: commandResult.response,
          createdAt: new Date(),
          chatId: id,
          isCommand: true,
        },
      ];

      // Save both messages
      await saveMessages({
        messages,
      });

      return createDataStreamResponse({
        execute: (dataStream) => {
          dataStream.write(
            `f:${JSON.stringify({
              messageId: assistantMessageId,
            })}\n`
          );
          dataStream.write(`0:${JSON.stringify(commandResult.response)}\n`);
        },
        onError: (error) => {
          console.error("Error processing command:", error);
          return "Oops, an error occured!";
        },
      });
    } catch (error) {
      console.error("Error processing command:", error);
      return new Response("Error processing command", { status: 500 });
    }
  }

  // Continue with normal chat processing
  const chat = await getChatById({ id });

  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId: session.user.id, title });
  }

  await saveMessages({
    messages: [{ ...userMessage, createdAt: new Date(), chatId: id } as any],
  });

  const commandMessages = await getCommandMessagesByChatId({ id });

  const cleanMessages = messages.filter((message) => {
    const isCommandMessage = commandMessages.some((cm) => cm.id === message.id);

    return !isCommandMessage;
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: model as LanguageModel,
        system: systemPrompt({ selectedChatModel }),
        messages: cleanMessages,
        // maxSteps: 5,
        maxTokens: 192,
        // experimental_activeTools:
        //   selectedChatModel === 'chat-model-reasoning'
        //     ? []
        //     : [
        //         'getWeather',
        //         'createDocument',
        //         'updateDocument',
        //         'requestSuggestions',
        //       ],
        experimental_transform: smoothStream({ chunking: "word" }),
        experimental_generateMessageId: generateUUID,
        onFinish: async ({ response, reasoning }) => {
          if (session.user?.id) {
            try {
              const sanitizedResponseMessages = sanitizeResponseMessages({
                messages: response.messages,
                reasoning,
              });

              await saveMessages({
                messages: sanitizedResponseMessages.map((message) => {
                  return {
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                  };
                }) as any,
              });
            } catch (error) {
              console.error("Failed to save chat");
            }
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: "stream-text",
        },
      });

      result.mergeIntoDataStream(dataStream, {
        sendReasoning: true,
      });
    },
    onError: (error) => {
      console.log({ error });
      return "Oops, an error occured!";
    },
  });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
