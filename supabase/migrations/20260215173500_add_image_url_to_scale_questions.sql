-- Add per-question image support for scale rendering
ALTER TABLE scale_questions
ADD COLUMN IF NOT EXISTS image_url TEXT;
