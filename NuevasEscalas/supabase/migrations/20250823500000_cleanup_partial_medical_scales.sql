-- =====================================================
-- Cleanup Partial Medical Scales Migration
-- =====================================================
-- This migration drops any partially created medical scales tables
-- to allow the adapted migration to run cleanly
-- =====================================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS scale_translations CASCADE;
DROP TABLE IF EXISTS user_favorites CASCADE;
DROP TABLE IF EXISTS scale_usage_metrics CASCADE;
DROP TABLE IF EXISTS scale_assessments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS data_access_logs CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS scale_references CASCADE;
DROP TABLE IF EXISTS scoring_ranges CASCADE;
DROP TABLE IF EXISTS scale_scoring CASCADE;
DROP TABLE IF EXISTS question_options CASCADE;
DROP TABLE IF EXISTS scale_questions CASCADE;
DROP TABLE IF EXISTS medical_scales CASCADE;

-- Drop types if they were created
DO $$ 
BEGIN
    DROP TYPE IF EXISTS assessment_status CASCADE;
    DROP TYPE IF EXISTS reference_type CASCADE;
    DROP TYPE IF EXISTS scoring_method CASCADE;
    DROP TYPE IF EXISTS question_type CASCADE;
    DROP TYPE IF EXISTS scale_status CASCADE;
EXCEPTION WHEN OTHERS THEN
    -- Ignore errors if types don't exist
    NULL;
END $$;

-- Note: This prepares the database for the adapted migration
-- Run 20250824000000_medical_scales_adapted.sql after this
