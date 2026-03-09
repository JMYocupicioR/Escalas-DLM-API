-- Comprehensive RLS fix for all scale tables needed by ScaleRunner
-- Version: 2.0.0
-- Date: 2026-02-10
-- Description: Allow authenticated users to read all scale-related tables including
--              scale_versions, scale_questions, and question_options.

-- Drop ALL existing read policies first to avoid conflicts
DROP POLICY IF EXISTS "Public can view published versions" ON scale_versions;
DROP POLICY IF EXISTS "Public can view published scales questions" ON scale_questions;
DROP POLICY IF EXISTS "Authenticated users can read all scale versions" ON scale_versions;
DROP POLICY IF EXISTS "Authenticated users can read all scale questions" ON scale_questions;
DROP POLICY IF EXISTS "Authenticated users can read all question options" ON question_options;
DROP POLICY IF EXISTS "Public can view question options" ON question_options;

-- Create comprehensive read policies for authenticated users on ALL scale tables

-- 1. scale_versions: Allow authenticated users to read all versions
CREATE POLICY "Authenticated users can read all scale versions" 
    ON scale_versions FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- 2. scale_questions: Allow authenticated users to read all questions
CREATE POLICY "Authenticated users can read all scale questions" 
    ON scale_questions FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- 3. question_options: Allow authenticated users to read all options
CREATE POLICY "Authenticated users can read all question options" 
    ON question_options FOR SELECT 
    USING (auth.uid() IS NOT NULL);

-- Keep write policies restricted to super_admin (existing policies should handle this)
