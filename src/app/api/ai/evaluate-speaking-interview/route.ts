import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { INTERVIEW_PROMPT } from "@/utils/prompts/speakingPrompts";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { questions, transcripts } = await req.json();

    if (!questions || !transcripts || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing questions or transcripts array" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const qString = questions
      .map((q: string, i: number) => `Question ${i + 1}: ${q}`)
      .join("\n");
    const tString = transcripts
      .map((t: string, i: number) => `Response ${i + 1}: ${t}`)
      .join("\n");

    const systemInstruction = INTERVIEW_PROMPT
      .replace("[Q1..Q4]", qString)
      .replace("[A1..A4]", tString);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Evaluate the student transcripts based on the interview rubric.",
            },
          ],
        },
      ],
      systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const responseText = result.response.text();
    const evaluation = JSON.parse(responseText);

    return NextResponse.json({ success: true, evaluation });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to evaluate";
    console.error("Error evaluating Interview:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}