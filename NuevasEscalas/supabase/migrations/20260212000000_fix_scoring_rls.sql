-- Fix RLS for scoring and scoring_ranges to allow public read access
-- Version: 1.0.0
-- Description: The scoring configuration is not sensitive data, it's just metadata for calculating scores.
--              Allow authenticated users to read all scoring data regardless of scale status.

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Scoring inherit scale visibility" ON scale_scoring;
DROP POLICY IF EXISTS "Ranges inherit scoring visibility" ON scoring_ranges;

-- Create permissive read policies for authenticated users
CREATE POLICY "Authenticated users can read all scoring" 
    ON scale_scoring FOR SELECT 
    USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read all scoring ranges" 
    ON scoring_ranges FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Keep write policies restricted to super_admin (existing policies should handle this)
-- The super_admin write policies were created in previous migrations and should remain
