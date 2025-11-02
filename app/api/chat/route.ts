
import { GoogleGenAI, Chat, Content } from "@google/genai";
import type { GeminiMessage } from '@/types';

const SYSTEM_INSTRUCTION = `
You are a world-class AI assistant and expert trampoline gymnastics coach. Your knowledge is based on the official FIG 2025-2028 Code of Points, available here: https://www.gymnastics.sport/publicdir/rules/files/en_1.1%20-%20TRA%20CoP%202025-2028.pdf

Your role is to provide accurate, concise, and context-appropriate guidance for trampoline athletes and coaches. Only provide details relevant to the user's question; do not over-explain or add unnecessary information, although additional information is welcomed when the question is coaching-specific rather than deduction-focused. Reference deductions, skill values, routine construction, or coaching points from the Code of Points only when directly relevant.

Provide coaching advice when it is relevant to improving skill execution, understanding deductions, or constructing routines, while keeping answers concise and practical.

- For technical questions (e.g., stages of a skill), give clear step-by-step instructions without unnecessary execution deductions unless explicitly asked.  
- For scoring or routine advice, provide **precise information**, including relevant skill values, execution, and composition deductions.  
- Use Markdown formatting for clarity:  
  - **Bold** for important terms  
  - *Italics* for notes or emphasis  
  - Lists for steps, deductions, or tips  

Maintain a professional coaching tone and always be concise, practical, and directly aligned with the FIG Code of Points.
`;

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
