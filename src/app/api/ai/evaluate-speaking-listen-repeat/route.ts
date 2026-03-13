import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LISTEN_AND_REPEAT_PROMPT } from "@/utils/prompts/speakingPrompts";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { prompt, transcript } = await req.json();

    if (!prompt) {
      return NextResponse.json({ success: false, error: "Missing prompt" }, { status: 400 });
    }

    // Gracefully handle empty/missing transcript — the AI will evaluate it as 0
    const safeTranscript = transcript?.trim() || "[No speech detected]";

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = LISTEN_AND_REPEAT_PROMPT
      .replace("[PROMPT]", prompt)
      .replace("[TRANSCRIPT]", safeTranscript);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Evaluate the student transcript based on the rubric." }] }],
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const responseText = result.response.text();
    
    // Parse the JSON strictly
    const evaluation = JSON.parse(responseText);

    return NextResponse.json({ success: true, evaluation });

  } catch (error: any) {
    console.error("Error evaluating Listen and Repeat:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to evaluate" },
      { status: 500 }
    );
  }
}
