import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ACADEMIC_DISCUSSION_EVALUATION_PROMPT } from "@/utils/prompts/writingPrompts";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(req: Request) {
  try {
    const { studentResponse, professorPost, professorQuestion, studentPosts } =
      await req.json();

    if (!studentResponse || !professorPost) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing studentResponse or professorPost",
        },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `${professorPost}\n\nQuestion: ${professorQuestion}`;
    const postsString = (studentPosts || [])
      .map(
        (post: { name: string; text: string }, idx: number) =>
          `Student ${idx + 1} (${post.name}): ${post.text}`
      )
      .join("\n");

    const systemInstruction = ACADEMIC_DISCUSSION_EVALUATION_PROMPT
      .replace("[PROMPT]", prompt)
      .replace("[STUDENT_POSTS]", postsString)
      .replace("[TEXT]", studentResponse);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Evaluate the student response based on the official TOEFL Writing rubric for Academic Discussion.",
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
      error instanceof Error
        ? error.message
        : "Failed to evaluate discussion response";
    console.error("Error evaluating Academic Discussion:", errorMessage);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
