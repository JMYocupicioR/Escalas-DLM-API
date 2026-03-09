-- Query to check if there are any published scale_versions
-- This will help debug the 406 error

SELECT 
    sv.id,
    sv.scale_id,
    sv.version_number,
    sv.published_at,
    ms.name as scale_name
FROM scale_versions sv
JOIN medical_scales ms ON ms.id = sv.scale_id
WHERE sv.published_at IS NOT NULL
ORDER BY sv.published_at DESC
LIMIT 10;

-- If the above returns no results, check for ANY versions at all:
SELECT 
    sv.id,
    sv.scale_id,
    sv.version_number,
    sv.published_at,
    sv.created_at,
    ms.name as scale_name
FROM scale_versions sv
JOIN medical_scales ms ON ms.id = sv.scale_id
ORDER BY sv.created_at DESC
LIMIT 10;
