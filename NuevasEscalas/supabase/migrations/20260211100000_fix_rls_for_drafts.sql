-- Fix RLS policies to allow viewing draft scales components
-- Version: 2.0.2
-- Description: Updates policies on child tables (questions, options, scoring, references) to allow access if the user is the creator or a practitioner/admin, even if the scale is a draft.

-- scale_questions
DROP POLICY IF EXISTS "Questions inherit scale visibility" ON scale_questions;

CREATE POLICY "Questions inherit scale visibility" ON scale_questions FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM medical_scales ms
        WHERE ms.id = scale_questions.scale_id 
        AND (
            ms.status = 'active' 
            OR 
            (auth.role() = 'authenticated' AND ms.created_by = auth.uid())
            OR
            (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practitioner', 'admin', 'super_admin')))
        )
    ));

-- question_options
DROP POLICY IF EXISTS "Options inherit question visibility" ON question_options;

CREATE POLICY "Options inherit question visibility" ON question_options FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM scale_questions sq
        JOIN medical_scales ms ON sq.scale_id = ms.id
        WHERE sq.id = question_options.question_id 
        AND (
            ms.status = 'active'
            OR 
            (auth.role() = 'authenticated' AND ms.created_by = auth.uid())
            OR
            (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practitioner', 'admin', 'super_admin')))
        )
    ));

-- scale_scoring
DROP POLICY IF EXISTS "Scoring inherit scale visibility" ON scale_scoring;

CREATE POLICY "Scoring inherit scale visibility" ON scale_scoring FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM medical_scales ms
        WHERE ms.id = scale_scoring.scale_id
        AND (
            ms.status = 'active'
            OR 
            (auth.role() = 'authenticated' AND ms.created_by = auth.uid())
            OR
            (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practitioner', 'admin', 'super_admin')))
        )
    ));

-- scoring_ranges
DROP POLICY IF EXISTS "Ranges inherit scoring visibility" ON scoring_ranges;

CREATE POLICY "Ranges inherit scoring visibility" ON scoring_ranges FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM scale_scoring ss
        JOIN medical_scales ms ON ss.scale_id = ms.id
        WHERE ss.id = scoring_ranges.scoring_id
        AND (
            ms.status = 'active'
            OR 
            (auth.role() = 'authenticated' AND ms.created_by = auth.uid())
            OR
            (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practitioner', 'admin', 'super_admin')))
        )
    ));

-- scale_references
DROP POLICY IF EXISTS "References inherit scale visibility" ON scale_references;

CREATE POLICY "References inherit scale visibility" ON scale_references FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM medical_scales ms
        WHERE ms.id = scale_references.scale_id
        AND (
            ms.status = 'active'
            OR 
            (auth.role() = 'authenticated' AND ms.created_by = auth.uid())
            OR
            (auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practitioner', 'admin', 'super_admin')))
        )
    ));
