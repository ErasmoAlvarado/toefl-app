import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createAdminClient } from '@/lib/supabase/admin'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    let topic: string
    let taskType: string
    let difficulty: string
    try {
      const body = await req.json()
      topic = body.topic || 'General Academic Topic'
      taskType = body.taskType || 'random'
      difficulty = body.difficulty || 'random'
    } catch (e) {
      topic = 'General Academic Topic'
      taskType = 'random'
      difficulty = 'random'
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    })

    const taskTypeInstruction = taskType !== 'random' 
      ? `Crucially, YOU MUST generate EXACTLY a '${taskType}' prompt.` 
      : `Choose a task type randomly between 'listen_and_repeat' and 'interview'.`;
    const difficultyInstruction = difficulty !== 'random' 
      ? `The difficulty level should be Level ${difficulty} out of 5.` 
      : `Choose a suitable difficulty level between 1 and 5.`;

    const prompt = `Generate a TOEFL iBT speaking practice task.
Topic to focus on (if applicable or possible): ${topic}
Task Type requirement: ${taskTypeInstruction}
Difficulty requirement: ${difficultyInstruction}

If the task type is 'listen_and_repeat':
- Generate EXACTLY 7 distinct sentences related to the topic.
- Store these 7 sentences as a JSON array of strings in the 'prompt_text' field (e.g. '["Sentence 1.", "Sentence 2.", ...]'), serialized as a single JSON string if necessary or array.
- Set 'type' to "listen_and_repeat". Use task_number 1.

If the task type is 'interview':
- Generate a short, realistic interview prompt setting the context.
- Store it as a single string in the 'prompt_text' field.
- Set 'type' to "interview". Use task_number 2.

Return as valid JSON:
{
  "type": "listen_and_repeat" | "interview",
  "task_number": number,
  "difficulty": number,
  "prompt_text": string,
  "reading_passage": null,
  "listening_transcript": null,
  "preparation_time": 0,
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
    
    // Ensure prompt_text is properly stored if AI returns an array, since DB expects a string
    const promptTextToStore = typeof generated.prompt_text === 'string'
      ? generated.prompt_text
      : JSON.stringify(generated.prompt_text);

    const { data: insertedData, error: dbError } = await supabase
      .from('speaking_prompts')
      .insert({
        type: generated.type,
        task_number: generated.task_number,
        difficulty: generated.difficulty || (difficulty !== 'random' ? parseInt(difficulty, 10) : 3),
        prompt_text: promptTextToStore,
        reading_passage: generated.reading_passage || null,
        listening_transcript: generated.listening_transcript || null,
        preparation_time: generated.preparation_time || 0,
        response_time: generated.response_time || 20,
        sample_response: generated.sample_response || null,
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
