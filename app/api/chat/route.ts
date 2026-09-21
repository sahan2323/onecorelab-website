import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not configured" },
      { status: 500 }
    );
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 }
      );
    }

    const systemInstruction = `You are the oneCoreLab Assistant, a helpful, friendly, and concise AI representative for oneCoreLab (a web development agency). 
Your goal is to answer questions about the agency, its services, and guide potential clients to reach out via the contact form, WhatsApp (+1 437 707 8022), or email (onecorelabs7@gmail.com). 
Keep responses brief and engaging.`;

    // Map OpenAI/Widget roles to Gemini roles
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents,
      config: {
        systemInstruction,
      },
    });

    return NextResponse.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
