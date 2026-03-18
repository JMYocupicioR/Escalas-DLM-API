-- =====================================================
-- Add Missing RLS Policies for Medical Scales
-- =====================================================
-- This migration adds only the scale visibility policies
-- User-dependent policies will be added separately after
-- resolving schema type inconsistencies
-- =====================================================

-- Scale components inherit scale visibility
CREATE POLICY "Questions inherit scale visibility" ON scale_questions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM medical_scales WHERE id = scale_id AND status = 'active'));

CREATE POLICY "Options inherit question visibility" ON question_options FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM scale_questions sq 
        JOIN medical_scales ms ON sq.scale_id = ms.id 
        WHERE sq.id = question_id AND ms.status = 'active'
    ));

CREATE POLICY "Scoring inherit scale visibility" ON scale_scoring FOR SELECT 
    USING (EXISTS (SELECT 1 FROM medical_scales WHERE id = scale_id AND status = 'active'));

CREATE POLICY "Ranges inherit scoring visibility" ON scoring_ranges FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM scale_scoring ss 
        JOIN medical_scales ms ON ss.scale_id = ms.id 
        WHERE ss.id = scoring_id AND ms.status = 'active'
    ));

CREATE POLICY "References inherit scale visibility" ON scale_references FOR SELECT 
    USING (EXISTS (SELECT 1 FROM medical_scales WHERE id = scale_id AND status = 'active'));

-- Comments
COMMENT ON POLICY "Questions inherit scale visibility" ON scale_questions IS 'Questions are visible if their parent scale is active';

-- NOTE: Patient, assessment, favorites, and audit log policies will be added
-- via Supabase dashboard after confirming column types
