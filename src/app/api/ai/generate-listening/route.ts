import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const prompt = `Generate TOEFL iBT Listening content for the UPDATED TOEFL format effective Jan 21, 2026.
Return JSON containing:
1) 15 'Listen and Choose a Response' items:
   - audio_prompt_text (what the student hears; do NOT show as text in exam mode)
   - 4 written answer options
   - correct option + explanation
   - accent tag (en-US/en-GB/en-AU)
2) 6 'Listen to a Conversation' transcripts (short), each with questions
3) 6 'Listen to an Announcement' transcripts (short academic-related announcement), each with questions
4) 6 'Listen to an Academic Talk' transcripts of 175-250 words (podcast-like), each with questions

Also output an MST plan (router/upper/lower modules), with some unscored tryout items marked.

Return valid JSON exactly in this structure:
{
  "choose_responses": [
    {
      "audio_prompt_text": "...",
      "options": ["...", "...", "...", "..."],
      "correct_option": "...",
      "explanation": "...",
      "accent_tag": "en-US"
    }
  ],
  "conversations": [
    {
      "transcript": "...",
      "questions": [
        {
          "text": "...",
          "type": "Detail",
          "options": ["...", "...", "...", "..."],
          "correctAnswer": "...",
          "explanation": "..."
        }
      ]
    }
  ],
  "announcements": [
    {
      "transcript": "...",
      "questions": [ ... ]
    }
  ],
  "academic_talks": [
    {
      "transcript": "...",
      "questions": [ ... ]
    }
  ],
  "mst_plan": {
    "router": ["choose_response_1", "choose_response_2", ...],
    "upper": ["conversation_1", ...],
    "lower": ["announcement_1", ...],
    "tryout_items": ["choose_response_15"]
  }
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    let generated: any;
    try {
      generated = JSON.parse(responseText);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid JSON from AI' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: generated });

  } catch (error: any) {
    console.error("Generate Listening API Error:", error);
    return NextResponse.json({ error: error.message || 'Error generating listening material' }, { status: 500 });
  }
}
