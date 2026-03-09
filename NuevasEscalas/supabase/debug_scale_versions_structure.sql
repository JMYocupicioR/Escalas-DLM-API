-- Check the structure of scale_versions table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'scale_versions'
ORDER BY ordinal_position;

-- Try to select a single version with specific columns to see what works
SELECT 
    id,
    scale_id,
    version_number,
    published_at,
    created_at
FROM scale_versions
WHERE scale_id = 'c3fa2488-f0c9-49a8-8bcc-f8ae9cecac38'
AND published_at IS NOT NULL
ORDER BY published_at DESC
LIMIT 1;

-- Try to see what columns might be causing issues (JSONB columns)
SELECT 
    *
FROM scale_versions
WHERE scale_id = 'c3fa2488-f0c9-49a8-8bcc-f8ae9cecac38'
AND published_at IS NOT NULL
ORDER BY published_at DESC
LIMIT 1;
