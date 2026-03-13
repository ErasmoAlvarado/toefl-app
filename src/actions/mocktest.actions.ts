"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  FullMockTestData,
  MockReadingPassage,
  MockListeningItem,
  MockWritingSection,
  MockSpeakingSection,
  MockTestAttemptResult,
} from "@/types/mocktest.types";
import { ToeflQuestion } from "@/types/reading.types";
import { ListeningQuestion } from "@/types/listening.types";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Shuffle array in-place and return it */
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Split array into chunks of given sizes. Items can be reused if not enough. */
function splitIntoModules<T>(items: T[], sizes: number[]): T[][] {
  const shuffled = shuffle(items);
  const modules: T[][] = [];
  let cursor = 0;
  for (const size of sizes) {
    const mod: T[] = [];
    for (let i = 0; i < size; i++) {
      mod.push(shuffled[cursor % shuffled.length]);
      cursor++;
    }
    modules.push(mod);
  }
  return modules;
}

// ─────────────────────────────────────────────────────────────
// assembleMockTest — builds a random test from Supabase content
// ─────────────────────────────────────────────────────────────

export async function assembleMockTest(): Promise<{
  success: boolean;
  data?: FullMockTestData;
  error?: string;
  contentAvailability?: {
    reading: number;
    listening: number;
    writing: number;
    speaking: number;
  };
}> {
  try {
    const supabase = await createClient();

    // ── 1. Fetch all available content ──────────────────────
    const [readingRes, listeningRes, writingRes, speakingRes] = await Promise.all([
      supabase.from("reading_passages").select("*").order("created_at", { ascending: false }),
      supabase.from("listening_materials").select("*").order("created_at", { ascending: false }),
      supabase.from("writing_prompts").select("*").order("created_at", { ascending: false }),
      supabase.from("speaking_prompts").select("*").order("created_at", { ascending: false }),
    ]);

    const allReading = readingRes.data || [];
    const allListening = listeningRes.data || [];
    const allWriting = writingRes.data || [];
    const allSpeaking = speakingRes.data || [];

    const availability = {
      reading: allReading.length,
      listening: allListening.length,
      writing: allWriting.length,
      speaking: allSpeaking.length,
    };

    // Minimum content checks — need at least 1 of each core section
    if (allReading.length === 0 && allListening.length === 0) {
      return {
        success: false,
        error: "Not enough content. Add at least 1 reading passage and 1 listening material.",
        contentAvailability: availability,
      };
    }

    // ── 2. Assemble Reading Section (MST) ──────────────────
    // Split by difficulty: easy (<=2), hard (>=3)
    const easyReading = allReading.filter((p) => (p.difficulty ?? 3) <= 2);
    const hardReading = allReading.filter((p) => (p.difficulty ?? 3) >= 3);

    // Router: 2 passages (mixed), Upper: 1 hard, Lower: 1 easy
    // Graceful fallback: use whatever is available
    const readingShuffled = shuffle(allReading);
    const readingRouter = readingShuffled.slice(0, Math.min(2, readingShuffled.length));
    const readingRemaining = readingShuffled.filter((p) => !readingRouter.includes(p));

    const readingUpper = hardReading.filter((p) => !readingRouter.includes(p)).slice(0, 1);
    if (readingUpper.length === 0 && readingRemaining.length > 0) readingUpper.push(readingRemaining[0]);
    if (readingUpper.length === 0 && readingRouter.length > 0) readingUpper.push(readingRouter[0]); // reuse

    const readingLower = easyReading.filter((p) => !readingRouter.includes(p) && !readingUpper.includes(p)).slice(0, 1);
    if (readingLower.length === 0 && readingRemaining.filter((p) => !readingUpper.includes(p)).length > 0) {
      readingLower.push(readingRemaining.filter((p) => !readingUpper.includes(p))[0]);
    }
    if (readingLower.length === 0 && readingRouter.length > 0) readingLower.push(readingRouter[readingRouter.length - 1]); // reuse

    const toReadingPassage = (row: typeof allReading[0]): MockReadingPassage => ({
      id: row.id,
      title: row.title,
      content: row.content,
      passageType: (row.passage_type as "academic" | "daily_life") || "academic",
      questions: (row.questions ?? []) as unknown as ToeflQuestion[],
      isUnscored: false,
    });

    // ── 3. Assemble Listening Section (MST) ────────────────
    const easyListening = allListening.filter((l) => (l.difficulty ?? 3) <= 2);
    const hardListening = allListening.filter((l) => (l.difficulty ?? 3) >= 3);

    const listeningShuffled = shuffle(allListening);
    const listeningRouter = listeningShuffled.slice(0, Math.min(2, listeningShuffled.length));
    const listeningRemaining = listeningShuffled.filter((l) => !listeningRouter.includes(l));

    const listeningUpper = hardListening.filter((l) => !listeningRouter.includes(l)).slice(0, 1);
    if (listeningUpper.length === 0 && listeningRemaining.length > 0) listeningUpper.push(listeningRemaining[0]);
    if (listeningUpper.length === 0 && listeningRouter.length > 0) listeningUpper.push(listeningRouter[0]);

    const listeningLower = easyListening.filter((l) => !listeningRouter.includes(l) && !listeningUpper.includes(l)).slice(0, 1);
    if (listeningLower.length === 0 && listeningRemaining.filter((l) => !listeningUpper.includes(l)).length > 0) {
      listeningLower.push(listeningRemaining.filter((l) => !listeningUpper.includes(l))[0]);
    }
    if (listeningLower.length === 0 && listeningRouter.length > 0) listeningLower.push(listeningRouter[listeningRouter.length - 1]);

    const mapListeningType = (dbType: string): MockListeningItem["type"] => {
      switch (dbType) {
        case "conversation": return "conversation";
        case "lecture": return "academic_talk";
        case "response": return "choose_response";
        case "announcement": return "announcement";
        default: return "academic_talk";
      }
    };

    const toListeningItem = (row: typeof allListening[0]): MockListeningItem => ({
      id: row.id,
      title: row.title,
      type: mapListeningType(row.type),
      transcript: row.transcript || "",
      audioPromptText: row.transcript || "",
      questions: (row.questions ?? []) as unknown as ListeningQuestion[],
      isUnscored: false,
    });

    // ── 4. Assemble Writing Section (linear) ───────────────
    const emailPrompts = allWriting.filter((w) => w.type === "integrated" || w.type === "email");
    const discussionPrompts = allWriting.filter((w) => w.type === "academic_discussion");
    const buildSentencePrompts = allWriting.filter((w) => w.type === "build_sentence");

    const selectedEmail = emailPrompts.length > 0 ? shuffle(emailPrompts)[0] : null;
    const selectedDiscussion = discussionPrompts.length > 0 ? shuffle(discussionPrompts)[0] : null;

    // Parse email prompt into structured format
    const emailTask = selectedEmail
      ? {
          context: selectedEmail.prompt_text,
          instructions: "Write an appropriate email based on the scenario above. Include a greeting, body, and closing.",
          recipientName: "the recipient",
          recipientRelation: "as described",
        }
      : {
          context: "You need to write an email to a colleague about a project update.",
          instructions: "Include a greeting, body with the update, and a professional closing.",
          recipientName: "your colleague",
          recipientRelation: "coworker",
        };

    // Parse discussion prompt into structured format
    const discussionPosts = selectedDiscussion?.discussion_posts as any;
    const discussionTask = selectedDiscussion
      ? {
          professorPost: selectedDiscussion.prompt_text.split("\n\n")[0] || selectedDiscussion.prompt_text,
          professorQuestion: selectedDiscussion.prompt_text.split("\n\n").slice(1).join("\n\n") || "What is your opinion on this?",
          studentPosts: Array.isArray(discussionPosts)
            ? discussionPosts.map((p: any) => ({ name: p.name || "Student", text: p.text || p.post || "" }))
            : [{ name: "Alex", text: "I think we should consider both perspectives carefully." }],
        }
      : {
          professorPost: "Today we discuss the impact of technology on education.",
          professorQuestion: "Do you think technology improves or hinders the learning process?",
          studentPosts: [
            { name: "Alex", text: "Technology offers many advantages for interactive learning." },
            { name: "Sam", text: "I worry about screen time and its effects on focus." },
          ],
        };

    // Build a Sentence items (generate simple defaults if none in DB)
    let buildSentences = buildSentencePrompts.map((bs, idx) => {
      const parsed = (() => { try { return JSON.parse(bs.prompt_text); } catch { return null; } })();
      if (parsed && parsed.chunks && parsed.correctSentence) return { id: idx + 1, ...parsed };
      return { id: idx + 1, chunks: bs.prompt_text.split(" "), correctSentence: bs.prompt_text };
    });

    if (buildSentences.length === 0) {
      // Generate 5 default build-a-sentence items
      buildSentences = [
        { id: 1, chunks: ["important", "It", "to", "is", "regularly", "study"], correctSentence: "It is important to study regularly" },
        { id: 2, chunks: ["have", "Students", "complete", "to", "their", "assignments"], correctSentence: "Students have to complete their assignments" },
        { id: 3, chunks: ["The", "was", "professor", "the", "in", "lecture", "hall"], correctSentence: "The professor was in the lecture hall" },
        { id: 4, chunks: ["many", "are", "There", "online", "resources", "available"], correctSentence: "There are many online resources available" },
        { id: 5, chunks: ["improved", "Technology", "has", "modern", "education", "significantly"], correctSentence: "Technology has improved modern education significantly" },
      ];
    }

    const writingSection: MockWritingSection = {
      buildSentences,
      email: emailTask,
      academicDiscussion: discussionTask,
    };

    // ── 5. Assemble Speaking Section (linear) ──────────────
    const listenRepeatPrompts = allSpeaking.filter((s) => s.type === "listen_and_repeat");
    const interviewPrompts = allSpeaking.filter((s) => s.type === "interview");

    let listenAndRepeatSentences: string[] = [];
    if (listenRepeatPrompts.length > 0) {
      const selected = shuffle(listenRepeatPrompts)[0];
      try {
        const parsed = JSON.parse(selected.prompt_text);
        listenAndRepeatSentences = Array.isArray(parsed) ? parsed : [selected.prompt_text];
      } catch {
        listenAndRepeatSentences = [selected.prompt_text];
      }
    }
    if (listenAndRepeatSentences.length === 0) {
      listenAndRepeatSentences = [
        "The university campus has a new library building.",
        "Students are encouraged to participate in study groups.",
        "The deadline for the assignment is next Friday.",
        "Research shows that regular exercise improves concentration.",
        "The professor will hold office hours on Wednesday afternoon.",
        "Many students choose to study abroad during their junior year.",
        "Academic writing requires clear organization and evidence.",
      ];
    }

    let interviewQuestions: string[] = [];
    if (interviewPrompts.length > 0) {
      const selected = shuffle(interviewPrompts)[0];
      // Interview prompt_text often contains multiple questions
      interviewQuestions = selected.prompt_text
        .split(/(?:'\s*and\s*'|'\s*,\s*'|(?<=\?)\s*(?=')|[?]\s+)/i)
        .map((q) => q.replace(/^['"]|['"]$/g, "").trim())
        .filter((q) => q.length > 10)
        .slice(0, 4);
    }
    if (interviewQuestions.length === 0) {
      interviewQuestions = [
        "Tell me about a time you had to solve a difficult problem. What did you do?",
        "What are your goals for the next five years?",
        "Describe a person who has had a significant influence on your life.",
        "If you could change one thing about your education, what would it be?",
      ];
    }

    const speakingSection: MockSpeakingSection = {
      listenAndRepeat: listenAndRepeatSentences,
      interviewQuestions,
    };

    // ── 6. Collect content IDs ─────────────────────────────
    const readingIds = [...readingRouter, ...readingUpper, ...readingLower].map((p) => p.id);
    const listeningIds = [...listeningRouter, ...listeningUpper, ...listeningLower].map((l) => l.id);
    const writingIds = [selectedEmail?.id, selectedDiscussion?.id, ...buildSentencePrompts.map((b) => b.id)].filter(Boolean) as string[];
    const speakingIds = [...listenRepeatPrompts.slice(0, 1), ...interviewPrompts.slice(0, 1)].map((s) => s.id);

    // ── 7. Build FullMockTestData ──────────────────────────
    const testData: FullMockTestData = {
      id: crypto.randomUUID(),
      title: `Mock Test — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
      createdAt: new Date().toISOString(),
      contentIds: { readingIds, listeningIds, writingIds, speakingIds },
      reading: {
        router: { passages: readingRouter.map(toReadingPassage) },
        upper: { passages: readingUpper.map(toReadingPassage) },
        lower: { passages: readingLower.map(toReadingPassage) },
      },
      listening: {
        router: { items: listeningRouter.map(toListeningItem) },
        upper: { items: listeningUpper.map(toListeningItem) },
        lower: { items: listeningLower.map(toListeningItem) },
      },
      writing: writingSection,
      speaking: speakingSection,
    };

    return { success: true, data: testData, contentAvailability: availability };
  } catch (error: any) {
    console.error("Error assembling mock test:", error.message);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// saveMockTestResult — persist results to mock_test_attempts
// ─────────────────────────────────────────────────────────────

export async function saveMockTestResult(
  result: MockTestAttemptResult,
  testData: FullMockTestData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    // Get current user
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error } = await supabase.from("mock_test_attempts").insert({
      user_id: user.id,
      completed_at: result.completedAt,
      reading_ids: testData.contentIds.readingIds,
      listening_ids: testData.contentIds.listeningIds,
      writing_ids: testData.contentIds.writingIds,
      speaking_ids: testData.contentIds.speakingIds,
      reading_path: result.readingPath,
      listening_path: result.listeningPath,
      reading_score: result.sectionScores.find((s) => s.section === "reading")?.scaledScore ?? 0,
      listening_score: result.sectionScores.find((s) => s.section === "listening")?.scaledScore ?? 0,
      writing_score: result.sectionScores.find((s) => s.section === "writing")?.scaledScore ?? 0,
      speaking_score: result.sectionScores.find((s) => s.section === "speaking")?.scaledScore ?? 0,
      total_score: result.totalScore,
      answers: {
        reading: result.readingAnswers,
        listening: result.listeningAnswers,
        writing: result.writingResponses,
        speaking: result.speakingResponses,
      } as any,
      section_breakdown: result.sectionScores as any,
      recommendations: result.recommendations,
    });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Error saving mock test result:", error.message);
    return { success: false, error: error.message };
  }
}

// ─────────────────────────────────────────────────────────────
// fetchMockTestHistory — list past attempts for the user
// ─────────────────────────────────────────────────────────────

export async function fetchMockTestHistory(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mock_test_attempts")
      .select("id, created_at, completed_at, total_score, reading_score, listening_score, writing_score, speaking_score, reading_path, listening_path")
      .order("completed_at", { ascending: false })
      .limit(20);

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Error fetching mock test history:", error.message);
    return { success: false, error: error.message, data: [] };
  }
}
