-- Add scale_slug to scale_assessments and make scale_id nullable
-- Allows saving assessments from app by slug (e.g. 'barthel') without requiring medical_scales row.

ALTER TABLE scale_assessments
  ADD COLUMN IF NOT EXISTS scale_slug TEXT;

ALTER TABLE scale_assessments
  ALTER COLUMN scale_id DROP NOT NULL;

-- Ensure at least one of scale_id or scale_slug is set for completed assessments
COMMENT ON COLUMN scale_assessments.scale_slug IS 'App scale identifier (e.g. barthel, katz) when scale_id is not linked to medical_scales';
