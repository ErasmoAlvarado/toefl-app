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

    const prompt = `Generate a TOEFL iBT speaking prompt about ${topic}. 
Choose a task type from 1-4.
Include reading passage if applicable (tasks 2, 3), and listening transcript if applicable (tasks 2, 3, 4).

Return as valid JSON:
{
  "type": "independent" | "integrated",
  "task_number": number,
  "prompt_text": string,
  "reading_passage": string | null,
  "listening_transcript": string | null,
  "preparation_time": number,
  "response_time": number,
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
      .from('speaking_prompts')
      .insert({
        type: generated.type,
        task_number: generated.task_number,
        prompt_text: generated.prompt_text,
        reading_passage: generated.reading_passage,
        listening_transcript: generated.listening_transcript,
        preparation_time: generated.preparation_time,
        response_time: generated.response_time,
        sample_response: generated.sample_response,
      })
      .select('id')
      .single()

    if (dbError) throw dbError

    return NextResponse.json({ success: true, data: { id: insertedData.id, ...generated } })

  } catch (error: any) {
    console.error("Generate Speaking API Error:", error)
    return NextResponse.json({ error: error.message || 'Error generating prompt' }, { status: 500 })
  }
}
