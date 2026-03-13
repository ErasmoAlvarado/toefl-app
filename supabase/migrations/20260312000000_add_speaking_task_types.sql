-- Add new speaking task types for updated TOEFL iBT format
ALTER TYPE speaking_task_type ADD VALUE IF NOT EXISTS 'listen_and_repeat';
ALTER TYPE speaking_task_type ADD VALUE IF NOT EXISTS 'interview';
