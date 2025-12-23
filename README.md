<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>


# Trampoline Coach AI

A simple web-based AI chat Next.js app utilising Google's generative AI for responses

---

## Systems Used

- AI Model: Google Gemini (PaLM 2.5)
- Frontend Framework: Next.js (React)
- Styling: Tailwind CSS
- Language: TypeScript / JavaScript
- Hosting/Deployment: Vercel
- Dataset parsing - csv-parse

---

## Packages Installed

The app uses the following packages:

- React & Next.js: react, react-dom, next
- Google Gemini Client: @google/genai
- CSS & Styling: tailwindcss, postcss, autoprefixer
- Utilities / Types: TypeScript types defined in types.ts
- Other Components: Custom components ChatInput and ChatMessage for chat UI


---

## Agent Prompt / System Instruction

The AI uses the following system instruction as its “prompt”:

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


---

## Run AI Studio App Locally

This repository contains everything you need to run the Trampoline Coach AI locally.

### Setup

1. Install dependencies:

2. Generate the app API in AI Studio: https://aistudio.google.com/

3. Add your API key:
Create a `.env.local` file in the project root.
Set the `API_KEY` in [.env.local](.env.local) to your Gemini API key

4. Run the app locally: `npm run dev`

5. Open in browser:
Visit http://localhost:3000 to start chatting with your AI trampoline coach.


