-- Add original_author column to medical_scales table
-- This column is intended to store the name of the original author of the scale (e.g. "Folstein", "Katz")
-- distinct from the system user who created the record (created_by) or validated it (validated_by).

ALTER TABLE medical_scales 
ADD COLUMN IF NOT EXISTS original_author TEXT;

-- Update the search vector trigger to include the new column
CREATE OR REPLACE FUNCTION update_scale_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('spanish', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.acronym, '')), 'A') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.category, '')), 'C') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.specialty, '')), 'C') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.original_author, '')), 'C') || -- Added original_author
        setweight(to_tsvector('spanish', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- If there are any existing 'validated_by' values that are NOT UUIDs (which shouldn't happen due to type constraint, 
-- but conceptually we might want to move data if we had text in a text column), we can't easily move them.
-- However, since 'validated_by' is UUID, it only holds valid user IDs. 
-- We assume 'original_author' is new data.
