-- Verify that RLS policies were created successfully
-- Execute this in Supabase SQL Editor to check the current state

-- 1. Check all policies on scale_versions table
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
WHERE tablename = 'scale_versions'
ORDER BY policyname;

-- 2. Check all policies on scale_questions table
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
WHERE tablename = 'scale_questions'
ORDER BY policyname;

-- 3. Check all policies on question_options table
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
WHERE tablename = 'question_options'
ORDER BY policyname;

-- 4. Check if RLS is enabled on these tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('scale_versions', 'scale_questions', 'question_options')
ORDER BY tablename;
