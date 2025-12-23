import { GoogleGenAI, Chat, Content } from "@google/genai";
import type { GeminiMessage } from "@/types";
import { findRelevantSkills, loadSkills } from "@/lib/skills";

/**
 * Detect questions that require reasoning across the entire skill dataset
 * (e.g. highest / lowest / compare / hardest)
 */
function needsAllSkills(question: string): boolean {
  const q = question.toLowerCase();

  return (
    q.includes("highest") ||
    q.includes("lowest") ||
    q.includes("most difficult") ||
    q.includes("least difficult") ||
    q.includes("hardest") ||
    q.includes("easiest") ||
    q.includes("compare") ||
    q.includes("difference") ||
    q.includes("which skill")
  );
}

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

ANALYSIS RULE
- You MAY compare, rank, and analyze difficulty values when multiple skills are provided.

STRICT RULES
- If a skill is not listed in the SKILL INFORMATION, use the code of points to find said skill.
- Do NOT infer, estimate, or guess skill difficulty or notation if not stated.
- Do NOT invent skills or values.

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
    const { message, history } = (await req.json()) as {
      message: string;
      history: GeminiMessage[];
    };

    const chat: Chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
      history: history as Content[],
    });

    // Original Gemini message code
    // const result = await chat.sendMessageStream({ message });

    /**
     * Decide whether to:
     * - Provide ALL skills (analytical questions)
     * - OR only matched skills (specific skill questions)
     */
    const matchedSkills = needsAllSkills(message)
      ? loadSkills()
      : findRelevantSkills(message);


    // HARD SAFETY: Do not allow definitions without authoritative data
    if (
      matchedSkills.length === 0 &&
      !needsAllSkills(message)
    ) {
      return new Response(
        "I don’t have authoritative skill information for that skill in the current dataset. Please check the skill name or ask about a listed skill.",
        {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }
      );
    }

    const skillContext = matchedSkills.length
      ? matchedSkills
          .map(
            (s) => `
    • **${s.skill}**
      - Notation: ${s.notation}
      - Difficulty: ${s.difficulty}
      - Description: ${s.description}
    `
          )
          .join("\n")
      : "No relevant skill information found.";

    const groundedMessage = `
    SKILL INFORMATION (authoritative):
    ${skillContext}

    USER QUESTION:
    ${message}
    `;

    // Send grounded message to Gemini (user never sees this)
    const result = await chat.sendMessageStream({
      message: groundedMessage,
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
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}