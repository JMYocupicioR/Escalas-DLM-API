/*
  # Medical Scales Repository Schema
  
  Complete database schema for DeepLuxMed medical scales application.
  
  ## Features
  - Complete medical scales management
  - Multi-language support
  - User assessments and analytics
  - Row Level Security (RLS)
  - Full-text search capabilities
  - Audit logging and metrics
  
  ## Tables Created
  1. profiles - User profiles and roles
  2. medical_scales - Main scales repository
  3. scale_questions - Questions/items for each scale
  4. question_options - Answer options for questions
  5. scale_scoring - Scoring methodology
  6. scoring_ranges - Score interpretation ranges
  7. scale_references - Bibliographic references
  8. scale_translations - Multi-language support
  9. scale_assessments - Completed evaluations
  10. user_scale_favorites - User bookmarks
  11. scale_usage_metrics - Analytics and usage data
  12. security_audit_logs - Security and audit trail
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'practitioner', 'admin');
CREATE TYPE scale_status AS ENUM ('active', 'draft', 'deprecated', 'under_review');
CREATE TYPE question_type AS ENUM ('single_choice', 'multiple_choice', 'numeric', 'text', 'boolean');
CREATE TYPE scoring_method AS ENUM ('sum', 'average', 'weighted', 'complex', 'subscales');
CREATE TYPE reference_type AS ENUM ('original', 'validation', 'review', 'meta-analysis', 'guideline');

-- User profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role DEFAULT 'patient',
    full_name TEXT,
    medical_license VARCHAR(100),
    institution TEXT,
    specialty VARCHAR(100),
    country VARCHAR(3) DEFAULT 'MX',
    language VARCHAR(10) DEFAULT 'es',
    is_verified BOOLEAN DEFAULT FALSE,
    hipaa_agreement_signed BOOLEAN DEFAULT FALSE,
    hipaa_agreement_date TIMESTAMP WITH TIME ZONE,
    hipaa_agreement_version VARCHAR(20),
    last_security_check TIMESTAMP WITH TIME ZONE,
    encryption_key_version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Main medical scales table
CREATE TABLE IF NOT EXISTS medical_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    acronym VARCHAR(50),
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    specialty VARCHAR(100),
    body_system VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    time_to_complete VARCHAR(50),
    popularity INTEGER DEFAULT 0,
    popular BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    instructions TEXT,
    version VARCHAR(20) DEFAULT '1.0',
    language VARCHAR(10) DEFAULT 'es',
    status scale_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    created_by UUID REFERENCES auth.users(id),
    validated_by UUID REFERENCES auth.users(id),
    validation_date TIMESTAMP WITH TIME ZONE,
    cross_references TEXT[] DEFAULT '{}',
    doi VARCHAR(255),
    copyright_info TEXT,
    license VARCHAR(100) DEFAULT 'CC BY-NC 4.0',
    
    -- Search optimization
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('spanish', name || ' ' || COALESCE(acronym, '') || ' ' || description || ' ' || array_to_string(tags, ' '))
    ) STORED,
    
    -- Constraints
    CONSTRAINT valid_popularity CHECK (popularity >= 0),
    CONSTRAINT valid_version CHECK (version ~ '^[0-9]+\.[0-9]+(\.[0-9]+)?$')
);

-- Scale questions/items table
CREATE TABLE IF NOT EXISTS scale_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL, -- Unique within scale
    question_text TEXT NOT NULL,
    description TEXT,
    question_type question_type DEFAULT 'single_choice',
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    category VARCHAR(100), -- For grouping questions within scale
    instructions TEXT,
    min_value NUMERIC, -- For numeric questions
    max_value NUMERIC, -- For numeric questions
    step_value NUMERIC DEFAULT 1, -- For numeric questions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Constraints
    UNIQUE(scale_id, question_id),
    UNIQUE(scale_id, order_index),
    CONSTRAINT valid_numeric_range CHECK (
        (question_type != 'numeric') OR 
        (min_value IS NOT NULL AND max_value IS NOT NULL AND min_value <= max_value)
    )
);

-- Question answer options table
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES scale_questions(id) ON DELETE CASCADE,
    option_value NUMERIC NOT NULL,
    option_label TEXT NOT NULL,
    option_description TEXT,
    order_index INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Constraints
    UNIQUE(question_id, order_index),
    UNIQUE(question_id, option_value)
);

-- Scale scoring methodology table
CREATE TABLE IF NOT EXISTS scale_scoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    scoring_method scoring_method NOT NULL,
    min_score NUMERIC,
    max_score NUMERIC,
    weight_formula TEXT, -- JSON formula for weighted scoring
    subscale_info JSONB, -- For scales with subscales
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Constraints
    CONSTRAINT valid_score_range CHECK (
        min_score IS NULL OR max_score IS NULL OR min_score <= max_score
    )
);

-- Score interpretation ranges table
CREATE TABLE IF NOT EXISTS scoring_ranges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scoring_id UUID REFERENCES scale_scoring(id) ON DELETE CASCADE,
    min_value NUMERIC NOT NULL,
    max_value NUMERIC NOT NULL,
    interpretation_level VARCHAR(100) NOT NULL,
    interpretation_text TEXT NOT NULL,
    recommendations TEXT,
    color_code VARCHAR(7), -- Hex color for UI
    severity_level INTEGER DEFAULT 1, -- 1=normal, 2=mild, 3=moderate, 4=severe
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Constraints
    CONSTRAINT valid_range CHECK (min_value <= max_value),
    CONSTRAINT valid_hex_color CHECK (color_code IS NULL OR color_code ~ '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT valid_severity CHECK (severity_level BETWEEN 1 AND 5)
);

-- Bibliographic references table
CREATE TABLE IF NOT EXISTS scale_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL,
    journal VARCHAR(255),
    year INTEGER NOT NULL,
    volume VARCHAR(50),
    issue VARCHAR(50),
    pages VARCHAR(50),
    doi VARCHAR(255),
    pmid VARCHAR(50),
    pmcid VARCHAR(50),
    url TEXT,
    reference_type reference_type DEFAULT 'original',
    is_primary BOOLEAN DEFAULT FALSE,
    abstract TEXT,
    keywords TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Constraints
    CONSTRAINT valid_year CHECK (year BETWEEN 1900 AND EXTRACT(YEAR FROM NOW()) + 5),
    CONSTRAINT valid_url CHECK (url IS NULL OR url ~ '^https?://')
);

-- Multi-language translations table
CREATE TABLE IF NOT EXISTS scale_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    question_id UUID REFERENCES scale_questions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES question_options(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    language VARCHAR(10) NOT NULL,
    translator_id UUID REFERENCES auth.users(id),
    validated_by UUID REFERENCES auth.users(id),
    validation_date TIMESTAMP WITH TIME ZONE,
    quality_score INTEGER DEFAULT 5, -- 1-5 translation quality
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Constraints
    CONSTRAINT valid_quality_score CHECK (quality_score BETWEEN 1 AND 5),
    CHECK (
        (scale_id IS NOT NULL AND question_id IS NULL AND option_id IS NULL) OR
        (scale_id IS NULL AND question_id IS NOT NULL AND option_id IS NULL) OR
        (scale_id IS NULL AND question_id IS NULL AND option_id IS NOT NULL)
    )
);

-- Completed assessments table
CREATE TABLE IF NOT EXISTS scale_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID REFERENCES medical_scales(id),
    user_id UUID REFERENCES auth.users(id),
    patient_id UUID, -- Can reference external patient table
    patient_data JSONB, -- Encrypted patient info if no external table
    responses JSONB NOT NULL,
    total_score NUMERIC,
    subscale_scores JSONB, -- For scales with subscales
    interpretation TEXT,
    recommendations TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    completion_time_seconds INTEGER, -- Time taken to complete
    session_id UUID,
    device_info JSONB,
    ip_address INET,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Data integrity
    responses_hash TEXT, -- For detecting tampering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- User favorites/bookmarks table
CREATE TABLE IF NOT EXISTS user_scale_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    notes TEXT, -- User's personal notes about the scale
    tags TEXT[], -- User's custom tags
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Constraints
    UNIQUE(user_id, scale_id)
);

-- Usage analytics and metrics table
CREATE TABLE IF NOT EXISTS scale_usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    assessments_completed INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    avg_completion_time INTERVAL,
    bounce_rate DECIMAL(5,4), -- Percentage who left without completing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    
    -- Constraints
    UNIQUE(scale_id, date),
    CONSTRAINT valid_percentages CHECK (
        bounce_rate IS NULL OR (bounce_rate >= 0 AND bounce_rate <= 1)
    )
);

-- Security audit logs table
CREATE TABLE IF NOT EXISTS security_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    event_type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    ip_address INET,
    user_agent TEXT,
    details JSONB,
    severity INTEGER DEFAULT 1, -- 1=info, 2=warning, 3=error, 4=critical
    
    -- Constraints
    CONSTRAINT valid_severity CHECK (severity BETWEEN 1 AND 4)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_medical_scales_search ON medical_scales USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_medical_scales_category ON medical_scales(category);
CREATE INDEX IF NOT EXISTS idx_medical_scales_specialty ON medical_scales(specialty);
CREATE INDEX IF NOT EXISTS idx_medical_scales_tags ON medical_scales USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_medical_scales_status ON medical_scales(status);
CREATE INDEX IF NOT EXISTS idx_medical_scales_popularity ON medical_scales(popularity DESC);
CREATE INDEX IF NOT EXISTS idx_medical_scales_language ON medical_scales(language);

CREATE INDEX IF NOT EXISTS idx_scale_questions_scale_id ON scale_questions(scale_id);
CREATE INDEX IF NOT EXISTS idx_scale_questions_order ON scale_questions(scale_id, order_index);
CREATE INDEX IF NOT EXISTS idx_scale_questions_type ON scale_questions(question_type);

CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_question_options_order ON question_options(question_id, order_index);

CREATE INDEX IF NOT EXISTS idx_scale_assessments_scale_id ON scale_assessments(scale_id);
CREATE INDEX IF NOT EXISTS idx_scale_assessments_user_id ON scale_assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_scale_assessments_completed_at ON scale_assessments(completed_at);
CREATE INDEX IF NOT EXISTS idx_scale_assessments_patient_id ON scale_assessments(patient_id) WHERE patient_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_scale_favorites_user_id ON user_scale_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_scale_usage_metrics_date ON scale_usage_metrics(date);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_timestamp ON security_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON security_audit_logs(user_id);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_scales_updated_at 
    BEFORE UPDATE ON medical_scales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scale_questions_updated_at 
    BEFORE UPDATE ON scale_questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enhanced search function with filters
CREATE OR REPLACE FUNCTION search_scales(
    search_term TEXT DEFAULT '',
    category_filter TEXT DEFAULT NULL,
    specialty_filter TEXT DEFAULT NULL,
    language_filter TEXT DEFAULT 'es',
    limit_results INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    acronym VARCHAR(50),
    description TEXT,
    category VARCHAR(100),
    specialty VARCHAR(100),
    tags TEXT[],
    popularity INTEGER,
    rank REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ms.id,
        ms.name,
        ms.acronym,
        ms.description,
        ms.category,
        ms.specialty,
        ms.tags,
        ms.popularity,
        CASE 
            WHEN search_term = '' THEN 1.0
            ELSE ts_rank(ms.search_vector, plainto_tsquery(language_filter, search_term))
        END as rank
    FROM medical_scales ms
    WHERE 
        ms.status = 'active' AND
        ms.language = language_filter AND
        (category_filter IS NULL OR ms.category = category_filter) AND
        (specialty_filter IS NULL OR ms.specialty = specialty_filter) AND
        (search_term = '' OR ms.search_vector @@ plainto_tsquery(language_filter, search_term))
    ORDER BY 
        CASE WHEN search_term = '' THEN ms.popularity ELSE rank END DESC,
        ms.popularity DESC
    LIMIT limit_results;
END;
$$ LANGUAGE plpgsql;

-- Function to increment scale popularity
CREATE OR REPLACE FUNCTION increment_scale_popularity(scale_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE medical_scales 
    SET popularity = popularity + 1
    WHERE id = scale_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate scale statistics
CREATE OR REPLACE FUNCTION get_scale_statistics(scale_id UUID)
RETURNS TABLE (
    total_views BIGINT,
    total_assessments BIGINT,
    avg_score NUMERIC,
    avg_completion_time INTERVAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(sum.views), 0) as total_views,
        COALESCE(COUNT(sa.id), 0) as total_assessments,
        COALESCE(AVG(sa.total_score), 0) as avg_score,
        COALESCE(AVG(MAKE_INTERVAL(secs => sa.completion_time_seconds)), INTERVAL '0') as avg_completion_time
    FROM scale_usage_metrics sum
    FULL OUTER JOIN scale_assessments sa ON sa.scale_id = sum.scale_id
    WHERE COALESCE(sum.scale_id, sa.scale_id) = get_scale_statistics.scale_id;
END;
$$ LANGUAGE plpgsql;

-- Function to apply data retention policies
CREATE OR REPLACE FUNCTION apply_data_retention_policies()
RETURNS TABLE (records_affected INTEGER) AS $$
DECLARE
    audit_retention_days INTEGER := 2190; -- 6 years for HIPAA
    metrics_retention_days INTEGER := 1095; -- 3 years
    anonymous_assessments_retention_days INTEGER := 365; -- 1 year
    deleted_count INTEGER := 0;
BEGIN
    -- Delete old audit logs
    DELETE FROM security_audit_logs 
    WHERE timestamp < NOW() - INTERVAL '1 day' * audit_retention_days;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    -- Delete old metrics
    DELETE FROM scale_usage_metrics 
    WHERE date < CURRENT_DATE - INTERVAL '1 day' * metrics_retention_days;
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    -- Delete old anonymous assessments
    DELETE FROM scale_assessments 
    WHERE is_anonymous = TRUE 
    AND completed_at < NOW() - INTERVAL '1 day' * anonymous_assessments_retention_days;
    GET DIAGNOSTICS deleted_count = deleted_count + ROW_COUNT;
    
    RETURN QUERY SELECT deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_scoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_scale_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Medical scales: Public read for active scales, admin write
CREATE POLICY "Public read access for active scales" ON medical_scales
    FOR SELECT USING (status = 'active');

CREATE POLICY "Authenticated users can read all scales" ON medical_scales
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admin and practitioners can manage scales" ON medical_scales
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'practitioner')
        )
    );

-- Scale questions: Inherit permissions from parent scale
CREATE POLICY "Public read access for questions" ON scale_questions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM medical_scales ms
            WHERE ms.id = scale_questions.scale_id 
            AND ms.status = 'active'
        )
    );

CREATE POLICY "Admin can manage questions" ON scale_questions
    FOR ALL TO authenticated USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('admin', 'practitioner')
        )
    );

-- Question options: Inherit permissions from parent question
CREATE POLICY "Public read access for options" ON question_options
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scale_questions sq
            JOIN medical_scales ms ON ms.id = sq.scale_id
            WHERE sq.id = question_options.question_id 
            AND ms.status = 'active'
        )
    );

-- Scale scoring and ranges: Public read for active scales
CREATE POLICY "Public read access for scoring" ON scale_scoring
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM medical_scales ms
            WHERE ms.id = scale_scoring.scale_id 
            AND ms.status = 'active'
        )
    );

CREATE POLICY "Public read access for scoring ranges" ON scoring_ranges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM scale_scoring ss
            JOIN medical_scales ms ON ms.id = ss.scale_id
            WHERE ss.id = scoring_ranges.scoring_id 
            AND ms.status = 'active'
        )
    );

-- References: Public read
CREATE POLICY "Public read access for references" ON scale_references
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM medical_scales ms
            WHERE ms.id = scale_references.scale_id 
            AND ms.status = 'active'
        )
    );

-- Translations: Public read
CREATE POLICY "Public read access for translations" ON scale_translations
    FOR SELECT USING (true);

-- Assessments: Users can only access their own
CREATE POLICY "Users can read their own assessments" ON scale_assessments
    FOR SELECT TO authenticated USING (
        user_id = auth.uid() OR 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Users can create their own assessments" ON scale_assessments
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Favorites: Users can only access their own
CREATE POLICY "Users can manage their own favorites" ON user_scale_favorites
    FOR ALL TO authenticated USING (user_id = auth.uid());

-- Usage metrics: Public read, admin write
CREATE POLICY "Public read access for usage metrics" ON scale_usage_metrics
    FOR SELECT USING (true);

CREATE POLICY "System can update usage metrics" ON scale_usage_metrics
    FOR ALL USING (true); -- This will be restricted by application logic

-- Audit logs: Admins only
CREATE POLICY "Admins can read audit logs" ON security_audit_logs
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "System can create audit logs" ON security_audit_logs
    FOR INSERT WITH CHECK (true); -- Application handles this

-- Create views for common queries
CREATE OR REPLACE VIEW scales_with_stats AS
SELECT 
    ms.*,
    COALESCE(metrics.total_views, 0) as total_views,
    COALESCE(metrics.total_assessments, 0) as total_assessments,
    COALESCE(metrics.unique_users, 0) as unique_users
FROM medical_scales ms
LEFT JOIN (
    SELECT 
        scale_id,
        SUM(views) as total_views,
        SUM(assessments_completed) as total_assessments,
        SUM(unique_users) as unique_users
    FROM scale_usage_metrics
    GROUP BY scale_id
) metrics ON ms.id = metrics.scale_id
WHERE ms.status = 'active';

-- Insert initial data for existing scales
INSERT INTO medical_scales (
    id,
    name,
    acronym,
    description,
    category,
    specialty,
    body_system,
    tags,
    time_to_complete,
    popularity,
    popular,
    image_url,
    instructions,
    version,
    language,
    status,
    cross_references,
    license
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'Índice de Barthel',
    'IB',
    'Evaluación de actividades básicas de la vida diaria para medir el grado de independencia funcional en pacientes con trastornos neuromusculares y musculoesqueléticos.',
    'Functional',
    'Rehabilitación',
    'Sistema Musculoesquelético',
    ARRAY['ADL', 'Functional', 'Independence', 'Rehabilitation', 'Geriatrics'],
    '5-10 min',
    100,
    true,
    'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg',
    'El Índice de Barthel evalúa la capacidad de una persona para realizar diez actividades de la vida diaria consideradas como básicas, obteniéndose una estimación cuantitativa de su grado de independencia.',
    '1.0',
    'es',
    'active',
    ARRAY['FIM', 'Katz', 'Lawton'],
    'CC BY-NC 4.0'
),
(
    '00000000-0000-0000-0000-000000000002',
    'Escala de Boston para Túnel Carpiano',
    'BCTQ',
    'Cuestionario específico para evaluar la severidad de síntomas y el estado funcional en pacientes con síndrome del túnel carpiano.',
    'Functional',
    'Traumatología',
    'Extremidades Superiores',
    ARRAY['Carpal Tunnel', 'Hand Function', 'Neurological', 'BCTQ'],
    '10-15 min',
    85,
    true,
    'https://images.pexels.com/photos/8942761/pexels-photo-8942761.jpeg',
    'La Escala de Boston consta de dos subescalas: Severidad de Síntomas (SSS) con 11 preguntas y Estado Funcional (FSS) con 8 preguntas.',
    '1.0',
    'es',
    'active',
    ARRAY['DASH', 'QuickDASH'],
    'CC BY-NC 4.0'
);

-- Insert Barthel questions
INSERT INTO scale_questions (
    id,
    scale_id,
    question_id,
    question_text,
    description,
    question_type,
    order_index,
    is_required,
    category
) VALUES 
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'comida', 'Comida', 'Capacidad para comer por sí mismo', 'single_choice', 1, true, 'Autocuidado'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'lavado', 'Lavado (Baño)', 'Capacidad para lavarse solo', 'single_choice', 2, true, 'Autocuidado'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'vestido', 'Vestirse', 'Capacidad para ponerse y quitarse la ropa', 'single_choice', 3, true, 'Autocuidado'),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'arreglo', 'Arreglo personal', 'Capacidad para arreglarse y mantener la higiene personal', 'single_choice', 4, true, 'Autocuidado'),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'deposicion', 'Deposición', 'Control de la deposición', 'single_choice', 5, true, 'Control Esfínteres'),
('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'miccion', 'Micción', 'Control de la micción', 'single_choice', 6, true, 'Control Esfínteres'),
('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'retrete', 'Uso del retrete', 'Capacidad para utilizar el retrete de forma autónoma', 'single_choice', 7, true, 'Movilidad'),
('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'transferencias', 'Transferencias', 'Capacidad para transferirse de la cama o silla', 'single_choice', 8, true, 'Movilidad'),
('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'deambulacion', 'Deambulación', 'Capacidad para caminar o desplazarse', 'single_choice', 9, true, 'Movilidad'),
('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'escaleras', 'Subir y bajar escaleras', 'Capacidad para subir y bajar escaleras de forma autónoma', 'single_choice', 10, true, 'Movilidad');

-- Insert Barthel question options (showing pattern for first few questions)
INSERT INTO question_options (question_id, option_value, option_label, option_description, order_index) VALUES
-- Comida
('10000000-0000-0000-0000-000000000001', 10, 'Independiente', 'Capaz de comer por sí solo en un tiempo razonable. La comida puede ser cocinada y servida por otra persona.', 1),
('10000000-0000-0000-0000-000000000001', 5, 'Necesita ayuda', 'Para cortar la carne, extender la mantequilla... pero es capaz de comer solo/a.', 2),
('10000000-0000-0000-0000-000000000001', 0, 'Dependiente', 'Necesita ser alimentado por otra persona.', 3),

-- Lavado
('10000000-0000-0000-0000-000000000002', 5, 'Independiente', 'Capaz de lavarse entero, de entrar y salir del baño sin ayuda.', 1),
('10000000-0000-0000-0000-000000000002', 0, 'Dependiente', 'Necesita algún tipo de ayuda o supervisión.', 2),

-- Vestido
('10000000-0000-0000-0000-000000000003', 10, 'Independiente', 'Capaz de ponerse y quitarse la ropa sin ayuda.', 1),
('10000000-0000-0000-0000-000000000003', 5, 'Necesita ayuda', 'Realiza sin ayuda más de la mitad de estas tareas.', 2),
('10000000-0000-0000-0000-000000000003', 0, 'Dependiente', 'Necesita ayuda para la mayor parte de las tareas de vestirse.', 3);

-- Insert Barthel scoring
INSERT INTO scale_scoring (
    id,
    scale_id,
    scoring_method,
    min_score,
    max_score
) VALUES (
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'sum',
    0,
    100
);

-- Insert Barthel scoring ranges
INSERT INTO scoring_ranges (
    scoring_id,
    min_value,
    max_value,
    interpretation_level,
    interpretation_text,
    recommendations,
    color_code,
    severity_level,
    order_index
) VALUES 
('20000000-0000-0000-0000-000000000001', 0, 44, 'Severa', 'Incapacidad funcional severa. El paciente presenta una dependencia importante para las actividades básicas de la vida diaria.', 'Requiere asistencia completa. Considerar plan de rehabilitación intensivo.', '#ef4444', 4, 1),
('20000000-0000-0000-0000-000000000001', 45, 59, 'Grave', 'Incapacidad funcional grave. El paciente requiere asistencia regular para varias actividades básicas.', 'Necesita supervisión y asistencia parcial. Evaluar programas de rehabilitación.', '#f97316', 3, 2),
('20000000-0000-0000-0000-000000000001', 60, 79, 'Moderada', 'Incapacidad funcional moderada. El paciente necesita asistencia en algunas áreas específicas.', 'Asistencia selectiva. Potenciar independencia en áreas preservadas.', '#eab308', 2, 3),
('20000000-0000-0000-0000-000000000001', 80, 99, 'Ligera', 'Incapacidad funcional ligera. El paciente es mayormente independiente con mínima asistencia.', 'Supervisión ocasional. Mantener y mejorar capacidades actuales.', '#22c55e', 1, 4),
('20000000-0000-0000-0000-000000000001', 100, 100, 'Independiente', 'Independencia completa. El paciente puede realizar todas las actividades básicas sin asistencia.', 'Mantener nivel actual de independencia. Prevención de deterioro.', '#15803d', 1, 5);

-- Insert Barthel references
INSERT INTO scale_references (
    scale_id,
    title,
    authors,
    journal,
    year,
    volume,
    pages,
    doi,
    reference_type,
    is_primary
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Functional evaluation: the Barthel Index',
    ARRAY['Mahoney FI', 'Barthel DW'],
    'Maryland State Medical Journal',
    1965,
    '14',
    '61-65',
    '10.1037/t02366-000',
    'original',
    true
);

-- Create a function to update search vector when scale data changes
CREATE OR REPLACE FUNCTION update_scale_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('spanish', 
        NEW.name || ' ' || 
        COALESCE(NEW.acronym, '') || ' ' || 
        NEW.description || ' ' || 
        array_to_string(NEW.tags, ' ')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create notification function for scale updates
CREATE OR REPLACE FUNCTION notify_scale_update()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('scale_updated', json_build_object(
        'scale_id', NEW.id,
        'action', TG_OP,
        'name', NEW.name
    )::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER scale_update_notification
    AFTER INSERT OR UPDATE OR DELETE ON medical_scales
    FOR EACH ROW EXECUTE FUNCTION notify_scale_update();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create initial admin user function (run manually with actual user ID)
CREATE OR REPLACE FUNCTION create_admin_user(user_email TEXT)
RETURNS VOID AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id FROM auth.users WHERE email = user_email;
    
    IF user_id IS NOT NULL THEN
        UPDATE profiles 
        SET role = 'admin', is_verified = true
        WHERE id = user_id;
        
        RAISE NOTICE 'User % has been granted admin privileges', user_email;
    ELSE
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE medical_scales IS 'Repository of validated medical assessment scales and questionnaires';
COMMENT ON TABLE scale_questions IS 'Individual questions/items that comprise each medical scale';
COMMENT ON TABLE question_options IS 'Answer options for each scale question';
COMMENT ON TABLE scale_scoring IS 'Scoring methodology and calculation rules for each scale';
COMMENT ON TABLE scoring_ranges IS 'Score interpretation ranges and clinical recommendations';
COMMENT ON TABLE scale_assessments IS 'Completed scale evaluations by users';
COMMENT ON TABLE user_scale_favorites IS 'User bookmarks and favorite scales';
COMMENT ON TABLE scale_usage_metrics IS 'Analytics and usage statistics for scales';
COMMENT ON TABLE security_audit_logs IS 'Security events and audit trail';

COMMENT ON FUNCTION search_scales IS 'Full-text search function for medical scales with filtering capabilities';
COMMENT ON FUNCTION increment_scale_popularity IS 'Increases the popularity score of a scale when used';
COMMENT ON FUNCTION apply_data_retention_policies IS 'Automatically removes old data according to retention policies';