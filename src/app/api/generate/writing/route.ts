import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAdminClient } from "@/lib/supabase/admin";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    let topic: string;
    let taskType: string;
    let difficulty: string;
    try {
      const body = await req.json();
      topic = body.topic || "General Academic Topic";
      taskType = body.taskType || "random";
      difficulty = body.difficulty || "random";
    } catch {
      topic = "General Academic Topic";
      taskType = "random";
      difficulty = "random";
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    // Determine actual task type if random
    const possibleTypes = [
      "build_sentence",
      "email",
      "academic_discussion",
    ] as const;
    const actualTaskType =
      taskType !== "random"
        ? taskType
        : possibleTypes[Math.floor(Math.random() * possibleTypes.length)];

    const difficultyInstruction =
      difficulty !== "random"
        ? `The difficulty level should be Level ${difficulty} out of 5.`
        : `Choose a suitable difficulty level between 1 and 5.`;

    let prompt = "";

    if (actualTaskType === "build_sentence") {
      prompt = `Generate a TOEFL iBT 2026 "Build a Sentence" writing task.
Topic: ${topic}
${difficultyInstruction}

Generate exactly 10 items. Each item is a sentence split into word/phrase chunks.

Return valid JSON:
{
  "type": "build_sentence",
  "difficulty": number (1-5),
  "time_limit": 600,
  "prompt_text": "Build a Sentence: Reorder word chunks to form correct sentences.",
  "discussion_posts": null,
  "items": [
    {
      "id": number,
      "correctSentence": string,
      "chunks": string[] (shuffled, NOT in order, 1-4 words each)
    }
  ]
}

Rules:
- Sentences should be academic-appropriate (university, campus, lectures, research).
- Each sentence tests a different grammar point (relative clauses, participles, conditionals, comparatives, modals, etc.).
- Chunks must be SHUFFLED (not in correct order).
- Match the difficulty level to vocabulary and sentence complexity.`;
    } else if (actualTaskType === "email") {
      prompt = `Generate a TOEFL iBT 2026 "Write an Email" writing task.
Topic: ${topic}
${difficultyInstruction}

Create a realistic email-writing scenario in an academic or social context.

Return valid JSON:
{
  "type": "email",
  "difficulty": number (1-5),
  "time_limit": 600,
  "prompt_text": string (full scenario description including context, instructions, and who the email is to),
  "discussion_posts": null,
  "scenario": {
    "context": string (the situation/background),
    "instructions": string (what the student needs to write about),
    "recipientName": string,
    "recipientRelation": string (e.g. "Professor", "Building Manager", "Roommate", "Academic Advisor")
  }
}

Rules:
- The scenario should be realistic and plausible for a university student.
- It should require greeting, closing, politeness, and clear request/purpose.
- Match difficulty to complexity of the social situation and expected language register.`;
    } else {
      // academic_discussion
      prompt = `Generate a TOEFL iBT 2026 "Write for an Academic Discussion" writing task.
Topic: ${topic}
${difficultyInstruction}

Create a realistic academic discussion forum scenario with a professor's post, a question, and two student responses.

Return valid JSON:
{
  "type": "academic_discussion",
  "difficulty": number (1-5),
  "time_limit": 600,
  "prompt_text": string (the professor's full post + question),
  "discussion_posts": [
    { "name": string, "text": string },
    { "name": string, "text": string }
  ],
  "scenario": {
    "professorPost": string (professor's full detailed post, 3-5 sentences),
    "professorQuestion": string (specific question for discussion),
    "studentPosts": [
      { "name": string (a first name), "text": string (2-4 sentences, takes a clear position) },
      { "name": string (a different first name), "text": string (2-4 sentences, takes a different or opposing position) }
    ]
  }
}

Rules:
- The topic should be debatable with valid arguments on multiple sides.
- Student posts should present different perspectives to encourage engagement.
- Match difficulty to academic vocabulary, concept complexity, and expected argumentation depth.`;
    }

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let generated: Record<string, unknown>;
    try {
      generated = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON from AI" },
        { status: 500 }
      );
    }

    const supabase = createAdminClient();

    // Map generated type to DB enum — the DB currently has "integrated" and "academic_discussion"
    // We store build_sentence and email content in writing_prompts as "academic_discussion" or "integrated"
    // But actually the prompt content itself distinguishes the type.
    // Store the real type in the `discussion_posts` JSONB field alongside the scenario data.
    const dbType =
      actualTaskType === "academic_discussion"
        ? "academic_discussion"
        : "integrated";

    const promptTextToStore =
      typeof generated.prompt_text === "string"
        ? (generated.prompt_text as string)
        : JSON.stringify(generated.prompt_text);

    // Store scenario + items in discussion_posts JSONB for retrieval
    const metadataToStore = {
      writing_task_type: actualTaskType,
      scenario: generated.scenario || null,
      items: generated.items || null,
    };

    const { data: insertedData, error: dbError } = await supabase
      .from("writing_prompts")
      .insert({
        type: dbType,
        prompt_text: promptTextToStore,
        time_limit:
          (generated.time_limit as number) || 600,
        discussion_posts: metadataToStore as unknown as null,
        is_ai_generated: true,
      })
      .select("id")
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      data: { id: insertedData.id, ...generated },
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error generating writing prompt";
    console.error("Generate Writing API Error:", errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
