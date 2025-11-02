
import { GoogleGenAI, Chat } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are a world-class AI assistant and expert coach specializing in trampoline gymnastics. Your knowledge is based on the official FIG 2025-2028 Code of Points, which can be found here: https://www.gymnastics.sport/publicdir/rules/files/en_1.1%20-%20TRA%20CoP%202025-2028.pdf. You must answer questions related to routine construction, skill values, execution deductions, and coaching points based on this document. Be precise, helpful, and act as an expert coach. Format your answers clearly, using markdown for lists, bold text, and italics to improve readability.`;

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function createChatSession(): Chat {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
}
