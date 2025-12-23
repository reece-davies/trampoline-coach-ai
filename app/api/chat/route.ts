
import { GoogleGenAI, Chat, Content } from "@google/genai";
import type { GeminiMessage } from '@/types';
import { findRelevantSkills } from "@/lib/skills";

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
3. Do NOT provide FIG difficulty values or fig notation.

STRICT RULES
- If a skill is not listed in the SKILL INFORMATION, use the code of points to find said skill. Not all skills have been listed in the provided skills dataset.
- Do NOT infer, estimate, or guess skill difficulty or notation, if not stated otherwise in the provided skill dataset.
- Do NOT invent skills or values. Only use what's provided.

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
    
    // Original Gemini message code
    //const result = await chat.sendMessageStream({ message });

    const matchedSkills = findRelevantSkills(message);

    const skillContext = matchedSkills.length
      ? matchedSkills.map(s => `
    • **${s.skill}**
      - Notation: ${s.notation}
      - Difficulty: ${s.difficulty}
      - Description: ${s.description}
    `).join("\n")
      : "No relevant skill information found.";

    const groundedMessage = `
    SKILL INFORMATION (authoritative):
    ${skillContext}

    USER QUESTION:
    ${message}
    `;

    const result = await chat.sendMessageStream({
      message: groundedMessage
    });
    // end of input

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
