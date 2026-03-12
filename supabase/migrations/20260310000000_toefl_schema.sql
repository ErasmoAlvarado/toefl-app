-- =============================================================
-- TOEFL APP — MASTER SCHEMA v2
-- Robust, future-proof structure for TOEFL iBT 2026 preparation
-- =============================================================

-- -------------------------------------------------------------
-- 1. EXTENSIONS
-- -------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- -------------------------------------------------------------
-- 2. CUSTOM ENUM TYPES
-- -------------------------------------------------------------
CREATE TYPE public.user_role      AS ENUM ('NORMAL', 'ADMIN');
CREATE TYPE public.user_level     AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.practice_section AS ENUM ('reading', 'listening', 'speaking', 'writing');
CREATE TYPE public.passage_type   AS ENUM ('academic', 'daily_life');
CREATE TYPE public.listening_type AS ENUM ('lecture', 'conversation', 'response', 'announcement');
CREATE TYPE public.speaking_task_type AS ENUM ('independent', 'integrated');
CREATE TYPE public.writing_task_type  AS ENUM ('integrated', 'academic_discussion');
CREATE TYPE public.vocab_frequency    AS ENUM ('high', 'medium', 'low');

-- -------------------------------------------------------------
-- 3. TABLES
-- -------------------------------------------------------------

-- ── 3.1  profiles ────────────────────────────────────────────
-- One row per auth user. Created automatically via trigger.
CREATE TABLE public.profiles (
  id            UUID        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name     TEXT,
  avatar_url    TEXT,
  target_score  INT         CHECK (target_score BETWEEN 0 AND 120),
  exam_date     DATE,
  current_level user_level  DEFAULT 'intermediate',
  streak_days   INT         DEFAULT 0,
  total_xp      INT         DEFAULT 0,  -- gamification points
  role          user_role   DEFAULT 'NORMAL',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.2  practice_sessions ───────────────────────────────────
-- One row per completed exam/practice attempt (header record).
-- Details about individual answers live in user_question_attempts.
CREATE TABLE public.practice_sessions (
  id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID            NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  section      practice_section NOT NULL,
  mode         TEXT            DEFAULT 'practice', -- 'practice' | 'simulacro'
  score        INT             CHECK (score >= 0),
  max_score    INT             DEFAULT 30,
  time_spent   INT,            -- total seconds spent
  passage_id   UUID,           -- nullable FK (set for reading/listening)
  completed_at TIMESTAMPTZ     DEFAULT NOW(),
  details      JSONB           DEFAULT '{}'::jsonb -- legacy/extra metadata
);

-- ── 3.3  user_question_attempts ──────────────────────────────
-- One row per question answered in a session.
-- Enables per-question analytics: "Which question types does this user fail most?"
CREATE TABLE public.user_question_attempts (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id            UUID        NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  user_id               UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  passage_id            UUID        REFERENCES public.reading_passages(id) ON DELETE SET NULL,
  question_id           TEXT        NOT NULL,   -- the 'id' field inside the JSONB questions array
  question_type         TEXT        NOT NULL,   -- 'Factual Information', 'Insert Text', etc.
  user_answer           JSONB,                  -- string | string[] serialized
  is_correct            BOOLEAN,
  time_spent_seconds    INT,
  attempted_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3.4  reading_passages ─────────────────────────────────────
-- TOEFL reading passages with their questions stored as JSONB.
-- `questions` JSONB array: each element MUST have an 'id' field (guaranteed by trigger below).
CREATE TABLE public.reading_passages (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT         NOT NULL,
  content         TEXT         NOT NULL,
  topic_category  TEXT,
  passage_type    passage_type DEFAULT 'academic',
  difficulty      INT          CHECK (difficulty BETWEEN 1 AND 5),
  is_ai_generated BOOLEAN      DEFAULT TRUE,
  times_attempted INT          DEFAULT 0,
  questions       JSONB        DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ  DEFAULT NOW()
);

-- ── 3.5  listening_materials ─────────────────────────────────
CREATE TABLE public.listening_materials (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  title            TEXT           NOT NULL,
  audio_url        TEXT,
  transcript       TEXT,
  type             listening_type NOT NULL,
  topic_category   TEXT,
  difficulty       INT            CHECK (difficulty BETWEEN 1 AND 5),
  is_ai_generated  BOOLEAN        DEFAULT TRUE,
  questions        JSONB          DEFAULT '[]'::jsonb,
  duration_seconds INT,
  created_at       TIMESTAMPTZ    DEFAULT NOW()
);

-- ── 3.6  speaking_prompts ────────────────────────────────────
CREATE TABLE public.speaking_prompts (
  id                   UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  task_number          INT                CHECK (task_number BETWEEN 1 AND 4),
  type                 speaking_task_type NOT NULL,
  prompt_text          TEXT               NOT NULL,
  reading_passage      TEXT,
  listening_transcript TEXT,
  sample_response      TEXT,
  scoring_rubric       JSONB,
  preparation_time     INT, -- seconds
  response_time        INT, -- seconds
  is_ai_generated      BOOLEAN            DEFAULT TRUE,
  created_at           TIMESTAMPTZ        DEFAULT NOW()
);

-- ── 3.7  writing_prompts ─────────────────────────────────────
CREATE TABLE public.writing_prompts (
  id                   UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  type                 writing_task_type NOT NULL,
  prompt_text          TEXT              NOT NULL,
  reading_passage      TEXT,
  listening_transcript TEXT,
  discussion_posts     JSONB,
  sample_response      TEXT,
  scoring_rubric       JSONB,
  time_limit           INT, -- seconds
  is_ai_generated      BOOLEAN           DEFAULT TRUE,
  created_at           TIMESTAMPTZ       DEFAULT NOW()
);

-- ── 3.8  vocabulary_bank ─────────────────────────────────────
-- Global vocab (user_id IS NULL) managed by admins.
-- Personal vocab (user_id IS NOT NULL) managed by the user.
CREATE TABLE public.vocabulary_bank (
  id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  word             TEXT           NOT NULL,
  definition       TEXT           NOT NULL,
  example_sentence TEXT,
  toefl_frequency  vocab_frequency DEFAULT 'medium',
  category         TEXT,
  user_id          UUID           REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL = global
  mastered         BOOLEAN        DEFAULT FALSE,
  next_review_at   TIMESTAMPTZ,   -- for spaced repetition
  review_count     INT            DEFAULT 0,
  created_at       TIMESTAMPTZ    DEFAULT NOW()
);

-- ── 3.9  user_bookmarks ──────────────────────────────────────
-- Users can save favorite passages for later review.
CREATE TABLE public.user_bookmarks (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  passage_id UUID        NOT NULL REFERENCES public.reading_passages(id) ON DELETE CASCADE,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, passage_id)
);

-- ── 3.10  daily_goals ────────────────────────────────────────
CREATE TABLE public.daily_goals (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date                DATE        NOT NULL DEFAULT CURRENT_DATE,
  reading_done        BOOLEAN     DEFAULT FALSE,
  listening_done      BOOLEAN     DEFAULT FALSE,
  speaking_done       BOOLEAN     DEFAULT FALSE,
  writing_done        BOOLEAN     DEFAULT FALSE,
  vocabulary_reviewed INT         DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- -------------------------------------------------------------
-- 4. INDEXES (performance for common queries)
-- -------------------------------------------------------------
CREATE INDEX idx_practice_sessions_user_id   ON public.practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_section   ON public.practice_sessions(section);
CREATE INDEX idx_practice_sessions_completed ON public.practice_sessions(completed_at DESC);

CREATE INDEX idx_uqa_user_id       ON public.user_question_attempts(user_id);
CREATE INDEX idx_uqa_session_id    ON public.user_question_attempts(session_id);
CREATE INDEX idx_uqa_question_type ON public.user_question_attempts(question_type);
CREATE INDEX idx_uqa_is_correct    ON public.user_question_attempts(is_correct);

CREATE INDEX idx_reading_difficulty    ON public.reading_passages(difficulty);
CREATE INDEX idx_reading_passage_type  ON public.reading_passages(passage_type);
CREATE INDEX idx_reading_created_at    ON public.reading_passages(created_at DESC);

CREATE INDEX idx_vocab_user_id     ON public.vocabulary_bank(user_id);
CREATE INDEX idx_vocab_review_at   ON public.vocabulary_bank(next_review_at);

CREATE INDEX idx_bookmarks_user_id ON public.user_bookmarks(user_id);

-- -------------------------------------------------------------
-- 5. FUNCTIONS
-- -------------------------------------------------------------

-- ── 5.1  is_admin() — safe RLS helper ────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;

-- ── 5.2  set_updated_at() — auto-update updated_at ───────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

-- ── 5.3  assign_question_ids() ───────────────────────────────
-- Guarantees every question in reading_passages.questions has
-- a unique 'id' UUID field, even if the AI didn't generate one.
CREATE OR REPLACE FUNCTION public.assign_question_ids()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.questions IS NOT NULL AND jsonb_array_length(NEW.questions) > 0 THEN
    NEW.questions := (
      SELECT jsonb_agg(
        CASE
          WHEN (q->>'id') IS NULL OR (q->>'id') = ''
          THEN jsonb_set(q, '{id}', to_jsonb(gen_random_uuid()::text))
          ELSE q
        END
      )
      FROM jsonb_array_elements(NEW.questions) AS q
    );
  END IF;
  RETURN NEW;
END;
$$;

-- ── 5.4  handle_new_user() — auto-create profile ─────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'NORMAL')
  );
  RETURN NEW;
END;
$$;

-- -------------------------------------------------------------
-- 6. TRIGGERS
-- -------------------------------------------------------------

-- Auto-update updated_at on profiles
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-assign question IDs on reading_passages insert/update
CREATE TRIGGER trg_assign_question_ids
  BEFORE INSERT OR UPDATE OF questions ON public.reading_passages
  FOR EACH ROW EXECUTE FUNCTION public.assign_question_ids();

-- Auto-assign question IDs on listening_materials insert/update
CREATE TRIGGER trg_assign_listening_question_ids
  BEFORE INSERT OR UPDATE OF questions ON public.listening_materials
  FOR EACH ROW EXECUTE FUNCTION public.assign_question_ids();

-- Auto-create profile when a new auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS)
-- -------------------------------------------------------------
ALTER TABLE public.profiles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_passages       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listening_materials    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speaking_prompts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.writing_prompts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocabulary_bank        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_goals            ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- practice_sessions
CREATE POLICY "sessions_all_own" ON public.practice_sessions
  FOR ALL USING (auth.uid() = user_id);

-- user_question_attempts
CREATE POLICY "uqa_all_own" ON public.user_question_attempts
  FOR ALL USING (auth.uid() = user_id);

-- reading_passages — anyone reads, only admins or service role writes
CREATE POLICY "reading_select_all"   ON public.reading_passages FOR SELECT USING (true);
CREATE POLICY "reading_insert_admin" ON public.reading_passages FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "reading_update_admin" ON public.reading_passages FOR UPDATE USING (public.is_admin());
CREATE POLICY "reading_delete_admin" ON public.reading_passages FOR DELETE USING (public.is_admin());

-- listening_materials
CREATE POLICY "listening_select_all"   ON public.listening_materials FOR SELECT USING (true);
CREATE POLICY "listening_insert_admin" ON public.listening_materials FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "listening_update_admin" ON public.listening_materials FOR UPDATE USING (public.is_admin());
CREATE POLICY "listening_delete_admin" ON public.listening_materials FOR DELETE USING (public.is_admin());

-- speaking_prompts
CREATE POLICY "speaking_select_all"   ON public.speaking_prompts FOR SELECT USING (true);
CREATE POLICY "speaking_insert_admin" ON public.speaking_prompts FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "speaking_update_admin" ON public.speaking_prompts FOR UPDATE USING (public.is_admin());
CREATE POLICY "speaking_delete_admin" ON public.speaking_prompts FOR DELETE USING (public.is_admin());

-- writing_prompts
CREATE POLICY "writing_select_all"   ON public.writing_prompts FOR SELECT USING (true);
CREATE POLICY "writing_insert_admin" ON public.writing_prompts FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "writing_update_admin" ON public.writing_prompts FOR UPDATE USING (public.is_admin());
CREATE POLICY "writing_delete_admin" ON public.writing_prompts FOR DELETE USING (public.is_admin());

-- vocabulary_bank — global vocab readable by all, personal vocab by owner; admin manages both
CREATE POLICY "vocab_select" ON public.vocabulary_bank
  FOR SELECT USING (user_id IS NULL OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "vocab_insert_own" ON public.vocabulary_bank
  FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "vocab_manage_own" ON public.vocabulary_bank
  FOR ALL USING (auth.uid() = user_id OR public.is_admin());

-- user_bookmarks
CREATE POLICY "bookmarks_all_own" ON public.user_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- daily_goals
CREATE POLICY "goals_all_own" ON public.daily_goals
  FOR ALL USING (auth.uid() = user_id);

-- -------------------------------------------------------------
-- 8. SEED: ADMIN USER
-- -------------------------------------------------------------
DO $$
DECLARE
  admin_uid UUID := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@toefl.local') THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      admin_uid,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@toefl.local',
      crypt('123456711eE.', gen_salt('bf')),
      NOW(),
      '{"full_name":"ERASMO_ADMIN","role":"ADMIN"}'::jsonb,
      NOW(),
      NOW()
    );
  END IF;
END
$$;
