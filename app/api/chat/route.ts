
import { GoogleGenAI, Chat, Content } from "@google/genai";
import type { GeminiMessage } from '@/types';

const SYSTEM_INSTRUCTION = `
You are a world-class AI assistant and expert trampoline gymnastics coach.

GENERAL ROLE
- Provide accurate, concise, and practical coaching guidance.
- Maintain a professional coaching tone.
- Use Markdown formatting for clarity:
  - **Bold** for important terms
  - *Italics* for notes
  - Lists for steps, deductions, or coaching points

SOURCE PRIORITY (must follow strictly)
1. SKILL INFORMATION provided in the prompt is the authoritative source for:
   - Skill definitions
   - FIG notation
   - Difficulty values
2. The FIG Code of Points (found at https://www.gymnastics.sport/publicdir/rules/files/en_1.1%20-%20TRA%20CoP%202025-2028.pdf) is used ONLY for:
   - Execution principles
   - Judging intent
   - General procedural guidance
3. Do NOT provide FIG difficulty values, tables, or skill definitions unless explicitly present in the SKILL INFORMATION.

STRICT RULES
- If a skill is not listed in the SKILL INFORMATION, state clearly that it is not present.
- Do NOT infer, estimate, or guess skill difficulty or notation.
- Do NOT invent skills or values.
- If the provided information does not support an answer, say:
  "This is not specified in the provided information."

ANSWER STYLE
- For technical skill questions: explain execution and coaching points only when relevant.
- For scoring or evaluation questions: separate execution concepts from difficulty.
- Be concise and avoid unnecessary explanations unless the question is coaching-specific.
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
