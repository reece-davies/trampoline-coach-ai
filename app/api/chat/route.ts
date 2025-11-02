
import { GoogleGenAI, Chat, Content } from "@google/genai";
import type { GeminiMessage } from '@/types';

const SYSTEM_INSTRUCTION = `You are a world-class AI assistant and expert coach specializing in trampoline gymnastics. Your knowledge is based on the official FIG 2025-2028 Code of Points, which can be found here: https://www.gymnastics.sport/publicdir/rules/files/en_1.1%20-%20TRA%20CoP%202025-2028.pdf. You must answer questions related to routine construction, skill values, execution deductions, and coaching points based on this document. Be precise, helpful, and act as an expert coach. Format your answers clearly, using markdown for lists, bold text, and italics to improve readability.`;

const apiKey = process.env.API_KEY;
if (!apiKey) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  try {
    const { message, history } = (await req.json()) as { message: string; history: GeminiMessage[] };

    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history as Content[],
    });
    
    const result = await chat.sendMessageStream({ message });

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
