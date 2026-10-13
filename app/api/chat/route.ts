import { GoogleGenAI, type Content, type Part } from "@google/genai";
import { NextResponse } from "next/server";
import { SYSTEM_PROMPT, answerFromKnowledge } from "@/lib/assistant-knowledge";
import { TOOL_DECLARATIONS, runTool, type ToolAction } from "@/lib/assistant-tools";

const MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
// Max model round-trips per visitor message. Each tool call costs one.
const MAX_STEPS = 5;
// Keep requests small: recent history only, and no essays.
const MAX_HISTORY = 20;
const MAX_MESSAGE_CHARS = 2000;

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Gemini returns 503 when overloaded and 429 for per-minute limits — both
 * usually clear in a second or two. A used-up daily quota won't, so don't
 * make the visitor wait through retries for it.
 */
async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err: any) {
      const dailyQuota = err?.status === 429 && String(err?.message).includes("PerDay");
      const transient = err?.status === 503 || (err?.status === 429 && !dailyQuota);
      if (!transient || i >= attempts) throw err;
      await new Promise((r) => setTimeout(r, 800 * i));
    }
  }
}

/** The no-LLM answer, in the same shape the agent returns. */
function fallbackReply(question: string, actions: ToolAction[] = []) {
  const { answer, navigate } = answerFromKnowledge(question);
  if (navigate) actions = [...actions, { label: "Opened Projects", navigate }];
  return NextResponse.json({ reply: answer, actions });
}

export async function POST(req: Request) {
  let messages: ChatMessage[];
  try {
    const body = await req.json();
    messages = (Array.isArray(body?.messages) ? body.messages : [])
      .filter((m: any) => typeof m?.content === "string" && m.content.trim())
      .slice(-MAX_HISTORY)
      .map((m: any) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content.slice(0, MAX_MESSAGE_CHARS),
      }));
  } catch {
    messages = [];
  }

  const last = messages[messages.length - 1];
  if (!last || last.role !== "user") {
    return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });
  }

  // No key configured: still useful, just not agentic.
  if (!ai) {
    return fallbackReply(last.content);
  }

  const clientId = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const contents: Content[] = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const actions: ToolAction[] = [];

  try {
    for (let step = 0; step < MAX_STEPS; step++) {
      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL,
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
          },
        })
      );

      const calls = response.functionCalls ?? [];
      if (calls.length === 0) {
        const reply = response.text?.trim();
        return reply ? NextResponse.json({ reply, actions }) : fallbackReply(last.content, actions);
      }

      // Echo the model's turn back (it carries the call ids/signatures),
      // then answer every call in one user turn.
      const modelTurn = response.candidates?.[0]?.content;
      if (modelTurn) contents.push(modelTurn);

      const results: Part[] = [];
      for (const call of calls) {
        const name = call.name ?? "";
        let output: Record<string, unknown>;
        try {
          const result = await runTool(name, call.args ?? {}, { clientId });
          output = result.response;
          if (result.action) actions.push(result.action);
        } catch (err) {
          console.error(`Onycore tool ${name} failed`, err);
          output = { error: "That didn't work on our side. Suggest WhatsApp or email instead." };
        }
        results.push({ functionResponse: { id: call.id, name, response: output } });
      }
      contents.push({ role: "user", parts: results });
    }

    // Ran out of steps mid-task — hand off rather than loop forever.
    return NextResponse.json({
      reply:
        "I got a bit tangled up there. You can reach the team directly on WhatsApp (+1 437 707 8022) or onecorelabs7@gmail.com.",
      actions,
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    // Don't report failure for something that already happened.
    if (actions.length > 0) {
      return NextResponse.json({
        reply: "Done — the team has your details and will reply within 24 hours.",
        actions,
      });
    }
    // Gemini down or out of quota: the keyword answers are better than an error.
    return fallbackReply(last.content, actions);
  }
}
