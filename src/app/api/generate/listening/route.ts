import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createAdminClient } from '@/lib/supabase/admin'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    let topic: string
    try {
      const body = await req.json()
      topic = body.topic || 'General Academic Topic'
    } catch (e) {
      topic = 'General Academic Topic'
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    })

    const prompt = `Generate a TOEFL iBT listening material about ${topic}. 
Choose either a "lecture" or a "conversation".
Include exactly 5-6 questions following the TOEFL format.

Return as valid JSON:
{
  "title": string,
  "type": "lecture" | "conversation",
  "transcript": string,
  "difficulty": number,
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
        difficulty: generated.difficulty || 3,
        topic_category: topic,
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
