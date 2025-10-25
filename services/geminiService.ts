import { GoogleGenAI } from "@google/genai";

export async function* getAiResponseStream(prompt: string): AsyncGenerator<string> {
  // FIX: Removed API key check per coding guidelines, assuming it's always available.
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const stream = await ai.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: prompt,
       config: {
        systemInstruction: "You are an AI assistant. Provide concise, interesting, single-paragraph explanations suitable for a general audience. Your goal is to sound intelligent but easily understandable.",
      },
    });

    for await (const chunk of stream) {
      yield chunk.text;
    }
  } catch (error) {
    console.error("Error fetching AI response:", error);
    yield "Sorry, I encountered an error while processing your request. Please try again later.";
  }
};