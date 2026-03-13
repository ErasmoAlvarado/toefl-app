-- Add difficulty column to speaking_prompts
ALTER TABLE speaking_prompts ADD COLUMN IF NOT EXISTS difficulty integer;
