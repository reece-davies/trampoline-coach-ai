
export type Message = {
  role: 'user' | 'model';
  content: string;
};

// History format for the Gemini API
export type GeminiMessage = {
    role: 'user' | 'model';
    parts: { text: string }[];
};
