import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createAdminClient } from '@/lib/supabase/admin'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    let requestBody: any = {};
    
    try {
      requestBody = await req.json()
    } catch (e) {
      // Empty or invalid body is fine
    }

    const { topic: userTopic, listeningType: userListeningType, difficulty: userDifficulty } = requestBody;

    let typeToUse = userListeningType;
    if (!typeToUse || typeToUse === 'random') {
      typeToUse = Math.random() > 0.5 ? 'lecture' : 'conversation';
    }

    let topicToUse = userTopic;
    if (!topicToUse) {
      if (typeToUse === 'conversation') {
        const convTopics = ["Office Hours Problem", "Service Encounter", "Student Housing Issue", "Registration Issue"];
        topicToUse = convTopics[Math.floor(Math.random() * convTopics.length)];
      } else {
        const lecTopics = ["History of Rome", "Marine Biology", "Modern Art Movements", "Geology of Mars", "Early Concepts of Astronomy"];
        topicToUse = lecTopics[Math.floor(Math.random() * lecTopics.length)];
      }
    }

    let difficulty = Math.floor(Math.random() * 5) + 1; // Default random
    if (userDifficulty !== "random" && !isNaN(parseInt(userDifficulty))) {
      difficulty = parseInt(userDifficulty);
      if (difficulty < 1) difficulty = 1;
      if (difficulty > 5) difficulty = 5;
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    })

    const numQuestions = typeToUse === 'conversation' ? 5 : 6;

    const prompt = `Generate a TOEFL iBT test listening material about ${topicToUse}. 
The format MUST be a "${typeToUse}".
Include exactly ${numQuestions} questions following the TOEFL format. The difficulty level is ${difficulty} on a scale of 1-5.

Return as valid JSON:
{
  "title": string,
  "type": "${typeToUse}",
  "transcript": string,
  "difficulty": ${difficulty},
  "questions": [
    {
      "type": string,
      "question": string,
      "options": string[],
      "correctAnswer": string,
      "explanation": string
    }
  ]
}
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    
    let generated: any
    try {
      generated = JSON.parse(responseText)
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 })
    }

    const supabase = createAdminClient()

    const { data: insertedData, error: dbError } = await supabase
      .from('listening_materials')
      .insert({
        title: generated.title,
        type: generated.type,
        transcript: generated.transcript,
        difficulty: generated.difficulty || difficulty,
        topic_category: topicToUse,
        questions: generated.questions,
      })
      .select('id')
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ success: true, data: { id: insertedData.id, ...generated } })

  } catch (error: any) {
    console.error("Generate Listening API Error:", error)
    return NextResponse.json({ error: error.message || 'Error generating material' }, { status: 500 })
  }
}
