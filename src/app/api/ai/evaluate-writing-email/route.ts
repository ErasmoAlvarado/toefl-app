import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { EMAIL_EVALUATION_PROMPT } from "@/utils/prompts/writingPrompts";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { emailText, scenario } = await req.json();

    if (!emailText || !scenario) {
      return NextResponse.json(
        { success: false, error: "Missing emailText or scenario" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const systemInstruction = EMAIL_EVALUATION_PROMPT
      .replace("[SCENARIO]", scenario)
      .replace("[TEXT]", emailText);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Evaluate the student email based on the official TOEFL Writing rubric for Write an Email.",
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
      error instanceof Error ? error.message : "Failed to evaluate email";
    console.error("Error evaluating email:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
