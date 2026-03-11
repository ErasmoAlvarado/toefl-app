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

    const prompt = `Generate a TOEFL iBT writing prompt about ${topic}. 
Choose either "integrated" or "academic_discussion".

Return as valid JSON:
{
  "type": "integrated" | "academic_discussion",
  "prompt_text": string,
  "reading_passage": string | null,
  "listening_transcript": string | null,
  "discussion_posts": Json | null,
  "time_limit": number,
  "sample_response": string
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
      .from('writing_prompts')
      .insert({
        type: generated.type,
        prompt_text: generated.prompt_text,
        reading_passage: generated.reading_passage,
        listening_transcript: generated.listening_transcript,
        discussion_posts: generated.discussion_posts,
        time_limit: generated.time_limit,
        sample_response: generated.sample_response,
      })
      .select('id')
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ success: true, data: { id: insertedData.id, ...generated } })

  } catch (error: any) {
    console.error("Generate Writing API Error:", error)
    return NextResponse.json({ error: error.message || 'Error generating prompt' }, { status: 500 })
  }
}
