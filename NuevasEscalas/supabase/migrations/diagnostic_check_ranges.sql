-- Diagnostic query to check scoring_ranges data and foreign key relationship
-- Run this in Supabase SQL Editor to see what's happening with ranges

-- 1. Check if scoring_ranges data exists for the Katz scale
SELECT 
  sr.id,
  sr.scoring_id,
  sr.min_value,
  sr.max_value,
  sr.interpretation_level,
  sr.color_code,
  ss.scale_id,
  ms.name as scale_name
FROM scoring_ranges sr
JOIN scale_scoring ss ON sr.scoring_id = ss.id
JOIN medical_scales ms ON ss.scale_id = ms.id
WHERE ms.acronym = 'KATZ'
ORDER BY sr.min_value;

-- 2. Check what the foreign key column is actually called
SELECT 
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'scoring_ranges'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Check the scoring record for KATZ
SELECT 
  ss.id,
  ss.scale_id,
  ss.scoring_method,
  ms.name,
  ms.acronym,
  (SELECT COUNT(*) FROM scoring_ranges WHERE scoring_id = ss.id) as ranges_count
FROM scale_scoring ss
JOIN medical_scales ms ON ss.scale_id = ms.id
WHERE ms.acronym = 'KATZ';
