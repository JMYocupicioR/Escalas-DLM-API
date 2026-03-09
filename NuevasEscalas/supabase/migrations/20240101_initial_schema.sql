-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Master Tables (Data Categories)

CREATE TABLE categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE scales (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    acronym text,
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Many-to-Many mapping for Categories
CREATE TABLE scale_category_mapping (
    scale_id uuid REFERENCES scales(id) ON DELETE CASCADE,
    category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (scale_id, category_id)
);

-- 2. Versioning System (The Core)

CREATE TYPE scale_status AS ENUM ('draft', 'published', 'deprecated');

CREATE TABLE scale_versions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id uuid REFERENCES scales(id) ON DELETE CASCADE,
    version_number text NOT NULL, -- e.g., "1.0", "1.1"
    status scale_status DEFAULT 'draft',
    
    -- JSONB Columns for storing the structure
    -- We store the questions and scoring logic here to ensure immutability
    -- and faster reads (no need to join 50 questions every time)
    config jsonb DEFAULT '{}'::jsonb, -- Instructions, bibliography, etc.
    questions jsonb NOT NULL DEFAULT '[]'::jsonb, 
    scoring_logic jsonb DEFAULT '{}'::jsonb,
    
    created_at timestamp with time zone DEFAULT now(),
    published_at timestamp with time zone,
    
    UNIQUE(scale_id, version_number)
);

-- Trigger to prevent modification of PUBLISHED versions
CREATE OR REPLACE FUNCTION protect_published_versions()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status = 'published' AND (TG_OP = 'UPDATE' OR TG_OP = 'DELETE') THEN
         -- Allow only status change to 'deprecated'
        IF TG_OP = 'UPDATE' AND NEW.status = 'deprecated' THEN
            RETURN NEW;
        END IF;
        RAISE EXCEPTION 'Cannot modify a published version. Create a new version instead.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_protect_published_versions
BEFORE UPDATE OR DELETE ON scale_versions
FOR EACH ROW EXECUTE FUNCTION protect_published_versions();

-- 3. Assessments (Patient Data) WITH PARTITIONING
-- Note: Partitioning by range (created_at) is recommended for high volume
-- For simplicity in this script we create the parent table, but in production
-- you would run a script to create partitions (e.g., scale_assessments_y2025m01)

CREATE TABLE scale_assessments (
    id uuid DEFAULT uuid_generate_v4(), -- Partitioned tables technically need complexity with PKs, using simplistic approach for now
    patient_id uuid NOT NULL, -- Reference to your patients table
    performer_id uuid NOT NULL, -- Reference to auth.users (Doctor)
    scale_id uuid REFERENCES scales(id),
    version_id uuid REFERENCES scale_versions(id),
    
    -- Clinical Data
    started_at timestamp with time zone DEFAULT now(),
    completed_at timestamp with time zone,
    duration_seconds integer,
    
    total_score numeric,
    normalized_score numeric, -- 0-100%
    interpretation text,
    
    -- The raw answers (Snapshot of truth)
    responses jsonb NOT NULL DEFAULT '{}'::jsonb,
    
    -- Metadata
    device_info jsonb,
    location jsonb,
    
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    PRIMARY KEY (id, created_at) -- Composite PK for partitioning support
) PARTITION BY RANGE (created_at);

-- Create initial partition for 2024-2025
CREATE TABLE scale_assessments_2024_2025 PARTITION OF scale_assessments
    FOR VALUES FROM ('2024-01-01') TO ('2026-01-01');

CREATE TABLE scale_assessments_2026_future PARTITION OF scale_assessments
    FOR VALUES FROM ('2026-01-01') TO ('2030-01-01');


-- 4. Row Level Security (RLS)

ALTER TABLE scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_assessments ENABLE ROW LEVEL SECURITY;

-- Policies
-- Anyone can read active scales (Public Catalog)
CREATE POLICY "Public scales are viewable by everyone" 
ON scales FOR SELECT USING (is_active = true);

CREATE POLICY "Published versions are viewable by everyone" 
ON scale_versions FOR SELECT USING (status = 'published');

-- Doctors can CRUD their own assessments
-- Assuming auth.uid() matches performer_id
CREATE POLICY "Doctors can insert assessments" 
ON scale_assessments FOR INSERT 
WITH CHECK (auth.uid() = performer_id);

CREATE POLICY "Doctors can view assessments they performed" 
ON scale_assessments FOR SELECT 
USING (auth.uid() = performer_id);

-- 5. Indexes for Performance (High Volume)

CREATE INDEX idx_scales_name_trgm ON scales USING gin (name gin_trgm_ops); -- Requires pg_trgm extension
CREATE INDEX idx_assessments_patient ON scale_assessments(patient_id);
CREATE INDEX idx_assessments_performer ON scale_assessments(performer_id);
CREATE INDEX idx_assessments_responses_gin ON scale_assessments USING gin (responses); -- JSONB Index

