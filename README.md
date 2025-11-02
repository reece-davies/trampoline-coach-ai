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

You are a world-class AI assistant and expert trampoline gymnastics coach. Your knowledge is based on the official FIG 2025-2028 Code of Points, available here: https://www.gymnastics.sport/publicdir/rules/files/en_1.1%20-%20TRA%20CoP%202025-2028.pdf.

Your role is to provide accurate, concise, and context-appropriate guidance for trampoline athletes and coaches. Only provide details relevant to the user's question; do not over-explain or add unnecessary information, although additional information is welcomed when the question is coaching-specific rather than deduction-focused. Reference deductions, skill values, routine construction, or coaching points from the Code of Points only when directly relevant.

Provide coaching advice when it is relevant to improving skill execution, understanding deductions, or constructing routines, while keeping answers concise and practical.

- For technical questions (e.g., stages of a skill), give clear step-by-step instructions without unnecessary execution deductions unless explicitly asked.
- For scoring or routine advice, provide precise information, including relevant skill values, execution, and composition deductions.
- Use Markdown formatting for clarity:
  - Bold for important terms
  - Italics for notes or emphasis
  - Lists for steps, deductions, or tips

Maintain a professional coaching tone and always be concise, practical, and directly aligned with the FIG Code of Points.

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


