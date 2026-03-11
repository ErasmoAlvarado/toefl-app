import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createAdminClient } from '@/lib/supabase/admin'
import { GeneratedPassage } from '@/types/reading.types'

export const maxDuration = 300; // Allow up to 5 minutes for generation

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const ACADEMIC_TOPICS = [
  'Photosynthesis and Plant Adaptations',
  'Industrial Revolution in Europe',
  'Quantum Mechanics Basics',
  'Ancient Mesopotamian Trade',
  'Marine Biodiversity Conservation',
  'The Psychology of Learning',
  'Plate Tectonics and Earthquakes',
  'Evolution of the Atmosphere',
  'Modern Architecture Movements',
  'Early Concepts of Astronomy'
];

const DAILY_LIFE_TOPICS = [
  'Email: University Campus Shuttle Schedule Updates',
  'Announcement: Dormitory Maintenance Schedule',
  'Group Chat: Study group organizing a meeting for the final project',
  'Email: Changes to Cafeteria Meal Plans',
  'Flyer: Academic Advising Appointment Process',
  'Email: International Student Orientation Details',
  'Announcement: Campus Fitness Center New Policies',
  'Syllabus Excerpt: Guidelines for Final Projects',
  'Group Chat: Planning a Student Club Funding Application',
  'IT Help Desk Ticket: Login Instructions and Troubleshooting'
];

export async function POST(req: Request) {
  try {
    let requestBody: any = {};
    
    try {
      requestBody = await req.json()
    } catch (e) {
      // Empty or invalid body is fine
    }

    const { topic: userTopic, passageType: userPassageType, difficulty: userDifficulty } = requestBody;

    // Check rate limit (dummy check for now)
    // ...

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const generativeModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    // Determine if it's Academic or Daily Life
    let isAcademic = Math.random() > 0.5; // Default random
    if (userPassageType === "academic") isAcademic = true;
    if (userPassageType === "daily_life") isAcademic = false;

    // Select topic based on type
    let topicToUse = userTopic;
    if (!topicToUse) {
      const topicList = isAcademic ? ACADEMIC_TOPICS : DAILY_LIFE_TOPICS;
      topicToUse = topicList[Math.floor(Math.random() * topicList.length)];
    }

    // Determine Difficulty (1-5)
    let difficulty = Math.floor(Math.random() * 5) + 1; // Default random
    if (userDifficulty !== "random" && !isNaN(parseInt(userDifficulty))) {
      difficulty = parseInt(userDifficulty);
      // Ensure difficulty is within 1-5 range
      if (difficulty < 1) difficulty = 1;
      if (difficulty > 5) difficulty = 5;
    } else if (!isAcademic) { // If daily life and difficulty not specified, lean towards easier
      difficulty = Math.floor(Math.random() * 3) + 1;
    }


    let passageTypeDesc = isAcademic ? "Academic Reading" : "Read in Daily Life (Short, everyday functional text)";
    
    if (!isAcademic) {
      passageTypeDesc += `. The text MUST be visually formatted like its medium and be directly related to everyday situations (not academic). 
      For example, if it's an Email, include "From:", "To:", "Subject:", and "Date:" headers. 
      If it's a Group Chat, format it with timestamps and speakers like "\n[10:05 AM] Sarah: ...\n[10:07 AM] John: ...". 
      If it's an Announcement, Flyer, Menu, or Website, format it logically.`;
    }

    const wordCountDesc = isAcademic ? "of approximately 700 words" : "of EXACTLY 15 to 150 words";
    const numQuestions = isAcademic ? 10 : 3;

    let specificQuestionsInstruction = "";
    if (isAcademic) {
      specificQuestionsInstruction = `
- 2 Factual Information questions
- 1 Complete the Word question (student must reconstruct words from a small paragraph where the second half of every second word after the first sentence is missing)
- 1 Vocabulary in context question
- 1 Inference question  
- 1 Rhetorical Purpose question
- 1 Sentence Simplification question
- 1 Insert Text question (indicate 4 possible positions with [A][B][C][D] inside the passage text)
- 1 Prose Summary question (provide exactly 6 options, 3 correct)
- 1 additional question of any of the above types
`;
    } else {
       specificQuestionsInstruction = `
- 1 Factual Information question
- 1 Inference question
- 1 Vocabulary in context or Rhetorical Purpose question
(DO NOT include Complete the Word, Prose Summary, Insert Text, or Sentence Simplification for Daily Life)
`;
    }

    const prompt = `Generate a TOEFL iBT test reading passage ${wordCountDesc} about ${topicToUse}. 
The passage should match this format: ${passageTypeDesc}.
Include exactly ${numQuestions} questions following the new 2026 TOEFL format:
${specificQuestionsInstruction}

For each question provide:
- type: 'Factual Information' | 'Negative Factual Information' | 'Inference' | 'Rhetorical Purpose' | 'Vocabulary in context' | 'Reference' | 'Sentence Simplification' | 'Insert Text' | 'Prose Summary' | 'Complete the Word'
- question: The question instruction text. For 'Complete the Word', this should just be "Type the missing letters to complete the words in the paragraph."
- options: array of 4 string options (or 6 for Prose Summary). Omit for Insert Text and Complete the Word.
- correctAnswer: The exact string of the correct option. (For Prose Summary, use correctAnswers array instead). For Insert Text, use correctPosition ('A', 'B', 'C', or 'D'). Omit for Complete the Word.
- explanation: A detailed explanation of why the correct answer is right
- wrongExplanations: An object mapping the wrong option index ('A', 'B', etc) to a brief explanation of why it is wrong. Omit for Complete the Word.
- paragraphNumber: The paragraph number where the answer can be found

If the type is 'Complete the Word', you MUST provide these additional explicitly named fields INSTEAD of options/correctAnswer:
- paragraphWithBlanks: A short paragraph (70-100 words). The first sentence is complete. Starting from the second sentence, the latter half of every second word is replaced EXACTLY by 3 underscores ("___"). For example: "The first sentence is entirely normal. The sec___ sentence h___ blanks i___ it."
- blanks: An array of objects for each blank representing the removed letters, IN ORDER of appearance. Each object must have:
   - id: "blank-1", "blank-2", etc.
   - fullWord: The complete original word (e.g. "second")
   - missingPart: The exact letters that were replaced by the blanks (e.g. "ond")

Also output the "title" and "content" (The passage text, with paragraphs separated by \\n\\n, and including [A] [B] [C] [D] markers if there is an Insert Text question. Don't add blank spaces for Complete the Word directly in the reading passage text; the 'Complete the Word' paragraph must be completely separate from the main passage text).

Return as valid JSON.
{
  "title": string,
  "content": string,
  "questions": [
    // ${numQuestions} questions mapped exactly
  ]
}
`

    const result = await generativeModel.generateContent(prompt)
    const responseText = result.response.text()
    
    // Parse Gemini JSON response
    let generatedPassage: GeneratedPassage
    try {
      generatedPassage = JSON.parse(responseText)
    } catch (err) {
      console.error("Failed to parse Gemini response as JSON", responseText)
      return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 })
    }

    // Assign unique IDs to questions as a defensive client-side layer.
    // The DB trigger `trg_assign_question_ids` also does this on INSERT.
    if (Array.isArray(generatedPassage.questions)) {
      generatedPassage.questions = generatedPassage.questions.map((q: any, i: number) => ({
        ...q,
        id: q.id || `q-${i}-${crypto.randomUUID()}`,
      }))
    }

    // Save to Supabase immediately so the user can see it
    const supabase = createAdminClient()

    const passageData = {
      title: generatedPassage.title,
      content: generatedPassage.content,
      topic_category: isAcademic ? 'General Academic Topic' : 'Read in Daily Life',
      passage_type: (isAcademic ? 'academic' : 'daily_life') as 'academic' | 'daily_life',
      difficulty: difficulty,
      questions: generatedPassage.questions as any,
    }

    const { data: insertedData, error: dbError } = await supabase
      .from('reading_passages')
      .insert(passageData)
      .select('id')
      .single()

    if (dbError) {
      console.error("Database Error details:", dbError)
      return NextResponse.json({ error: 'Failed to save passage to database' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        id: insertedData.id,
        ...generatedPassage
      } 
    })

  } catch (error: any) {
    console.error("Generate API Error:", error)
    return NextResponse.json({ error: error.message || 'Error generating passage' }, { status: 500 })
  }
}

