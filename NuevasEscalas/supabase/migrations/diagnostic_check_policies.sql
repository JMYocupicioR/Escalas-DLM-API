-- Diagnostic query to check current RLS policies on scoring tables
-- Run this in Supabase SQL Editor to see what policies currently exist

-- Check policies on scale_scoring
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('scale_scoring', 'scoring_ranges')
ORDER BY tablename, policyname;
