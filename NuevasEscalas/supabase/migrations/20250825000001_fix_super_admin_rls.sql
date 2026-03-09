-- =====================================================
-- Fix Super Admin RLS Implementation (Column-Based)
-- =====================================================
-- This migration fixes the is_super_admin function to use
-- the 'role' column on the profiles table instead of
-- the non-existent user_roles table relation.
-- =====================================================

-- 1. Redefine is_super_admin to use the 'role' text column
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Check if the user has 'super_admin' or 'admin' role in profiles
    -- independent of RLS on profiles (due to SECURITY DEFINER)
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() 
        AND (role = 'super_admin' OR role = 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update Policies for medical_scales
-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Only super admin can manage scales" ON medical_scales;
DROP POLICY IF EXISTS "Public scales are viewable by everyone" ON medical_scales;
DROP POLICY IF EXISTS "Authenticated users can view active scales" ON medical_scales;
DROP POLICY IF EXISTS "Enable read access for all users" ON medical_scales;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON medical_scales;

-- Create comprehensive policies
-- A. Read Access: Anyone can read active scales
CREATE POLICY "Public/Authenticated can view active scales" 
ON medical_scales FOR SELECT 
USING (status = 'active' OR is_super_admin());

-- B. Write Access: Only Super Admins can insert/update/delete
CREATE POLICY "Super Admins can manage scales" 
ON medical_scales FOR ALL 
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- 3. Update Policies for Related Tables (Cascade permissions)

-- scale_questions
DROP POLICY IF EXISTS "Only super admin can manage questions" ON scale_questions;
CREATE POLICY "Super Admins can manage questions" 
ON scale_questions FOR ALL 
USING (is_super_admin()) 
WITH CHECK (is_super_admin());

-- question_options
DROP POLICY IF EXISTS "Only super admin can manage options" ON question_options;
CREATE POLICY "Super Admins can manage options" 
ON question_options FOR ALL 
USING (is_super_admin()) 
WITH CHECK (is_super_admin());

-- scale_scoring
DROP POLICY IF EXISTS "Only super admin can manage scoring" ON scale_scoring;
CREATE POLICY "Super Admins can manage scoring" 
ON scale_scoring FOR ALL 
USING (is_super_admin()) 
WITH CHECK (is_super_admin());

-- scoring_ranges
DROP POLICY IF EXISTS "Only super admin can manage scoring ranges" ON scoring_ranges;
CREATE POLICY "Super Admins can manage scoring ranges" 
ON scoring_ranges FOR ALL 
USING (is_super_admin()) 
WITH CHECK (is_super_admin());

-- scale_references
DROP POLICY IF EXISTS "Only super admin can manage references" ON scale_references;
CREATE POLICY "Super Admins can manage references" 
ON scale_references FOR ALL 
USING (is_super_admin()) 
WITH CHECK (is_super_admin());
