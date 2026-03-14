"use server";

import { createClient } from '@/lib/supabase/server';
import { ListeningMaterial, ListeningType } from '@/types/listening.types';

export async function fetchListeningMaterials(type?: ListeningType) {
  try {
    const supabase = await createClient();
    let query = supabase
      .from('listening_materials')
      .select('id, title, type, topic_category, transcript, duration_seconds, audio_url, created_at, difficulty, is_ai_generated, questions')
      .order('created_at', { ascending: false });
      
    if (type) {
      query = query.eq('type', type);
    }

    const { data: materials, error } = await query;

    if (error) {
      console.error('Error fetching listening materials:', error);
      return { success: false, error: 'Failed to fetch listening materials.' };
    }

    return { success: true, data: materials as unknown as ListeningMaterial[] };
  } catch (error: any) {
    console.error('Action error fetching listening materials:', error);
    return { success: false, error: error.message || 'Unknown error occurred.' };
  }
}

export async function fetchListeningMaterialById(id: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('listening_materials')
      .select('id, title, type, topic_category, transcript, duration_seconds, audio_url, created_at, difficulty, is_ai_generated, questions')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching listening material:', error);
      return { success: false, error: 'Failed to fetch listening material.' };
    }

    return { success: true, data: data as unknown as ListeningMaterial };
  } catch (error: any) {
    console.error('Action error fetching listening material:', error);
    return { success: false, error: error.message || 'Unknown error occurred.' };
  }
}

export async function saveListeningSession(
  materialsScore: number,
  maxScore: number,
  timeSpentSeconds: number,
  attempts: any[],
  listeningMaterialId?: string
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: 'User must be authenticated to save sessions.' };
    }

    // 1. Create Practice Session (Header)
    const { data: sessionData, error: sessionError } = await supabase
      .from('practice_sessions')
      .insert({
        user_id: user.id,
        section: 'listening',
        mode: 'practice',
        score: materialsScore,
        max_score: maxScore,
        time_spent: timeSpentSeconds,
        passage_id: null // Custom listening ID could correspond to passage_id, but the schema assumes passage_id relates to reading_passages. So we leave it null for listening, or we add listening_material_id to schema if needed. Since the schema lacks listening_material_id in practice_sessions, we can store it in details JSONB.
        // Wait, schema details: `details JSONB DEFAULT '{}'`
      })
      .select('id')
      .single();

    if (sessionError) {
      console.error('Failed to create practice session:', sessionError);
      return { success: false, error: 'Failed to save practice session.' };
    }

    const sessionId = sessionData.id;

    // 2. Prepare user question attempts
    const attemptsToInsert = attempts.map(attempt => ({
      session_id: sessionId,
      user_id: user.id,
      question_id: attempt.questionId,
      question_type: attempt.questionType,
      user_answer: attempt.userAnswer,
      is_correct: attempt.isCorrect,
      time_spent_seconds: attempt.timeSpentSeconds
    }));

    const { error: attemptError } = await supabase
      .from('user_question_attempts')
      .insert(attemptsToInsert);

    if (attemptError) {
      console.error('Failed to create question attempts:', attemptError);
      // Optional: rollback session creation, but not strictly necessary here.
      return { success: false, error: 'Failed to save question attempts.' };
    }

    // 3. If everything is fine, update practice session details with listening id
    if (listeningMaterialId) {
       await supabase.from('practice_sessions').update({
           details: { listening_material_id: listeningMaterialId }
       }).eq('id', sessionId);
    }

    return { success: true, data: { sessionId } };
  } catch (error: any) {
     console.error('Action error saving session:', error);
     return { success: false, error: error.message || 'Failed to save session.' };
  }
}
