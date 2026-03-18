-- Complete Medical Scales Database Schema
-- DeepLuxMed - Medical Scales Repository
-- Version: 2.0.0
-- HIPAA Compliant with Row Level Security

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create custom types
CREATE TYPE user_role AS ENUM ('patient', 'practitioner', 'admin');
CREATE TYPE scale_status AS ENUM ('active', 'draft', 'deprecated', 'under_review');
CREATE TYPE question_type AS ENUM ('single_choice', 'multiple_choice', 'numeric', 'text', 'boolean');
CREATE TYPE scoring_method AS ENUM ('sum', 'average', 'weighted', 'complex', 'custom');
CREATE TYPE reference_type AS ENUM ('original', 'validation', 'review', 'meta-analysis', 'clinical_trial');
CREATE TYPE assessment_status AS ENUM ('in_progress', 'completed', 'cancelled', 'expired');

-- =====================================================
-- CORE TABLES
-- =====================================================

-- User profiles with medical-specific fields
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'patient',
    email TEXT NOT NULL,
    full_name TEXT,
    medical_license TEXT,
    institution TEXT,
    specialty TEXT,
    department TEXT,
    phone TEXT,
    country TEXT DEFAULT 'ES',
    language TEXT DEFAULT 'es',
    timezone TEXT DEFAULT 'Europe/Madrid',
    
    -- Security and compliance
    last_security_check TIMESTAMPTZ,
    is_verified BOOLEAN DEFAULT FALSE,
    hipaa_agreement_signed BOOLEAN DEFAULT FALSE,
    hipaa_agreement_version TEXT,
    hipaa_agreement_date TIMESTAMPTZ,
    privacy_policy_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted BOOLEAN DEFAULT FALSE,
    
    -- Preferences
    notification_preferences JSONB DEFAULT '{}',
    ui_preferences JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    login_count INTEGER DEFAULT 0,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_role_license CHECK (
        (role = 'practitioner' AND medical_license IS NOT NULL) OR 
        (role != 'practitioner')
    )
);

-- Medical scales main table
CREATE TABLE medical_scales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    acronym TEXT,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    specialty TEXT,
    body_system TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Metadata
    time_to_complete TEXT,
    popularity INTEGER DEFAULT 0,
    popular BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    instructions TEXT,
    version TEXT DEFAULT '1.0',
    language TEXT DEFAULT 'es',
    status scale_status DEFAULT 'active',
    
    -- Scientific information
    cross_references TEXT[] DEFAULT '{}',
    doi TEXT,
    copyright_info TEXT,
    license TEXT DEFAULT 'CC BY-NC 4.0',
    
    -- Validation and quality
    validated_by UUID REFERENCES profiles(id),
    validation_date TIMESTAMPTZ,
    peer_reviewed BOOLEAN DEFAULT FALSE,
    evidence_level TEXT,
    clinical_utility_score NUMERIC(3,2),
    
    -- Usage statistics
    view_count INTEGER DEFAULT 0,
    assessment_count INTEGER DEFAULT 0,
    favorite_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    
    -- Search optimization
    search_vector TSVECTOR,
    
    -- Constraints
    CONSTRAINT valid_popularity CHECK (popularity >= 0),
    CONSTRAINT valid_clinical_utility CHECK (clinical_utility_score BETWEEN 0 AND 5),
    CONSTRAINT non_empty_name CHECK (LENGTH(TRIM(name)) > 0),
    CONSTRAINT non_empty_description CHECK (LENGTH(TRIM(description)) > 0)
);

-- Questions for scales
CREATE TABLE scale_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID NOT NULL REFERENCES medical_scales(id) ON DELETE CASCADE,
    question_id TEXT NOT NULL, -- Internal identifier within scale
    question_text TEXT NOT NULL,
    description TEXT,
    question_type question_type DEFAULT 'single_choice',
    order_index INTEGER NOT NULL,
    is_required BOOLEAN DEFAULT TRUE,
    category TEXT, -- For grouping questions
    instructions TEXT,
    
    -- Advanced question features
    conditional_logic JSONB, -- For skip logic
    validation_rules JSONB, -- Custom validation
    help_text TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_question_per_scale UNIQUE (scale_id, question_id),
    CONSTRAINT valid_order_index CHECK (order_index > 0),
    CONSTRAINT non_empty_question_text CHECK (LENGTH(TRIM(question_text)) > 0)
);

-- Question options/choices
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES scale_questions(id) ON DELETE CASCADE,
    option_value NUMERIC NOT NULL,
    option_label TEXT NOT NULL,
    option_description TEXT,
    order_index INTEGER NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    
    -- Advanced features
    conditional_next_question UUID REFERENCES scale_questions(id),
    color_code TEXT,
    icon_name TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_option_order CHECK (order_index > 0),
    CONSTRAINT non_empty_option_label CHECK (LENGTH(TRIM(option_label)) > 0)
);

-- Scoring system for scales
CREATE TABLE scale_scoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID NOT NULL REFERENCES medical_scales(id) ON DELETE CASCADE,
    scoring_method scoring_method NOT NULL,
    min_score NUMERIC,
    max_score NUMERIC,
    formula TEXT, -- For complex scoring
    weights JSONB, -- For weighted scoring
    
    -- Normalization data
    normalization_data JSONB,
    percentile_data JSONB,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_score_range CHECK (
        (min_score IS NULL AND max_score IS NULL) OR 
        (min_score IS NOT NULL AND max_score IS NOT NULL AND min_score <= max_score)
    ),
    CONSTRAINT one_scoring_per_scale UNIQUE (scale_id)
);

-- Scoring ranges for interpretation
CREATE TABLE scoring_ranges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scoring_id UUID NOT NULL REFERENCES scale_scoring(id) ON DELETE CASCADE,
    min_value NUMERIC NOT NULL,
    max_value NUMERIC NOT NULL,
    interpretation_level TEXT NOT NULL,
    interpretation_text TEXT NOT NULL,
    recommendations TEXT,
    color_code TEXT DEFAULT '#6B7280',
    order_index INTEGER NOT NULL,
    
    -- Clinical significance
    clinical_significance TEXT,
    severity_level TEXT,
    action_required BOOLEAN DEFAULT FALSE,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_range CHECK (min_value <= max_value),
    CONSTRAINT valid_range_order CHECK (order_index > 0),
    CONSTRAINT non_empty_interpretation CHECK (LENGTH(TRIM(interpretation_text)) > 0)
);

-- Scientific references
CREATE TABLE scale_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID NOT NULL REFERENCES medical_scales(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    authors TEXT[] NOT NULL,
    journal TEXT,
    year INTEGER NOT NULL,
    volume TEXT,
    issue TEXT,
    pages TEXT,
    doi TEXT,
    pmid TEXT,
    pmcid TEXT,
    url TEXT,
    reference_type reference_type DEFAULT 'original',
    is_primary BOOLEAN DEFAULT FALSE,
    
    -- Quality indicators
    impact_factor NUMERIC(5,3),
    citation_count INTEGER DEFAULT 0,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_year CHECK (year BETWEEN 1800 AND EXTRACT(YEAR FROM NOW()) + 5),
    CONSTRAINT valid_authors CHECK (array_length(authors, 1) > 0),
    CONSTRAINT non_empty_title CHECK (LENGTH(TRIM(title)) > 0)
);

-- Multi-language translations
CREATE TABLE scale_translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    question_id UUID REFERENCES scale_questions(id) ON DELETE CASCADE,
    option_id UUID REFERENCES question_options(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL, -- name, description, question_text, etc.
    original_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    language TEXT NOT NULL,
    
    -- Translation quality
    translator_id UUID REFERENCES profiles(id),
    validated_by UUID REFERENCES profiles(id),
    validation_date TIMESTAMPTZ,
    confidence_score NUMERIC(3,2),
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_language CHECK (LENGTH(language) = 2),
    CONSTRAINT valid_confidence CHECK (confidence_score BETWEEN 0 AND 1),
    CONSTRAINT non_empty_translation CHECK (LENGTH(TRIM(translated_text)) > 0),
    CONSTRAINT one_translation_per_field UNIQUE (scale_id, question_id, option_id, field_name, language)
);

-- =====================================================
-- ASSESSMENT AND USAGE TABLES
-- =====================================================

-- Patient information (anonymizable)
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT,
    age INTEGER,
    gender TEXT,
    medical_record_number TEXT,
    
    -- Anonymous identifier for privacy
    anonymous_id TEXT UNIQUE DEFAULT ('anon_' || substr(md5(random()::text), 1, 12)),
    
    -- Clinical information
    diagnosis_codes TEXT[],
    conditions TEXT[],
    medications TEXT[],
    
    -- Demographics
    ethnicity TEXT,
    education_level TEXT,
    occupation TEXT,
    
    -- Privacy and consent
    consent_given BOOLEAN DEFAULT FALSE,
    consent_date TIMESTAMPTZ,
    data_retention_date TIMESTAMPTZ,
    can_be_contacted BOOLEAN DEFAULT FALSE,
    
    -- Ownership and access control
    created_by UUID NOT NULL REFERENCES profiles(id),
    institution_id TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_age CHECK (age IS NULL OR (age >= 0 AND age <= 150)),
    CONSTRAINT anonymous_or_named CHECK (
        (name IS NOT NULL) OR (anonymous_id IS NOT NULL)
    )
);

-- Scale assessments/evaluations
CREATE TABLE scale_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID NOT NULL REFERENCES medical_scales(id),
    user_id UUID NOT NULL REFERENCES profiles(id),
    patient_id UUID REFERENCES patients(id),
    
    -- Assessment data
    responses JSONB NOT NULL DEFAULT '{}',
    total_score NUMERIC,
    subscale_scores JSONB,
    interpretation TEXT,
    clinical_notes TEXT,
    status assessment_status DEFAULT 'in_progress',
    
    -- Context information
    assessment_date TIMESTAMPTZ DEFAULT NOW(),
    location TEXT,
    assessor_name TEXT,
    assessment_reason TEXT,
    follow_up_required BOOLEAN DEFAULT FALSE,
    follow_up_date TIMESTAMPTZ,
    
    -- Session and device info
    session_id TEXT,
    device_info JSONB,
    ip_address INET,
    user_agent TEXT,
    
    -- Time tracking
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    
    -- Quality indicators
    completion_percentage NUMERIC(5,2) DEFAULT 0,
    validity_flags JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_completion_percentage CHECK (completion_percentage BETWEEN 0 AND 100),
    CONSTRAINT valid_duration CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    CONSTRAINT completed_has_total_score CHECK (
        (status != 'completed') OR (total_score IS NOT NULL)
    )
);

-- Usage metrics for analytics
CREATE TABLE scale_usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id UUID NOT NULL REFERENCES medical_scales(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Daily metrics
    views INTEGER DEFAULT 0,
    assessments_started INTEGER DEFAULT 0,
    assessments_completed INTEGER DEFAULT 0,
    unique_users INTEGER DEFAULT 0,
    avg_completion_time_seconds INTEGER,
    avg_score NUMERIC,
    
    -- User engagement
    bounce_rate NUMERIC(5,2), -- Percentage who left without completing
    return_users INTEGER DEFAULT 0,
    mobile_users INTEGER DEFAULT 0,
    desktop_users INTEGER DEFAULT 0,
    
    -- Geographic data (anonymized)
    top_countries JSONB DEFAULT '{}',
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_scale_date UNIQUE (scale_id, date),
    CONSTRAINT valid_bounce_rate CHECK (bounce_rate BETWEEN 0 AND 100)
);

-- User favorites
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    scale_id UUID NOT NULL REFERENCES medical_scales(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_scale_favorite UNIQUE (user_id, scale_id)
);

-- =====================================================
-- SECURITY AND AUDIT TABLES
-- =====================================================

-- Security audit logs
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    event_type TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    details JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'info', -- info, warning, error, critical
    
    -- Session tracking
    session_id TEXT,
    request_id TEXT,
    
    -- Geographical info (for security)
    country TEXT,
    city TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_severity CHECK (severity IN ('info', 'warning', 'error', 'critical'))
);

-- Data access logs (HIPAA compliance)
CREATE TABLE data_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    resource_type TEXT NOT NULL, -- 'patient', 'assessment', 'scale'
    resource_id UUID NOT NULL,
    action TEXT NOT NULL, -- 'view', 'create', 'update', 'delete', 'export'
    
    -- Context
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    
    -- Purpose and justification
    access_purpose TEXT,
    justification TEXT,
    
    -- Data sensitivity
    contains_phi BOOLEAN DEFAULT FALSE, -- Protected Health Information
    data_classification TEXT DEFAULT 'internal', -- public, internal, confidential, restricted
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT valid_action CHECK (action IN ('view', 'create', 'update', 'delete', 'export', 'print')),
    CONSTRAINT valid_classification CHECK (data_classification IN ('public', 'internal', 'confidential', 'restricted'))
);

-- System settings and configuration
CREATE TABLE system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    is_sensitive BOOLEAN DEFAULT FALSE,
    
    -- Version control
    version INTEGER DEFAULT 1,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Text search indexes
CREATE INDEX idx_medical_scales_search ON medical_scales USING GIN (search_vector);
CREATE INDEX idx_medical_scales_name_trgm ON medical_scales USING GIN (name gin_trgm_ops);
CREATE INDEX idx_medical_scales_description_trgm ON medical_scales USING GIN (description gin_trgm_ops);

-- Category and filtering indexes
CREATE INDEX idx_medical_scales_category ON medical_scales (category);
CREATE INDEX idx_medical_scales_specialty ON medical_scales (specialty);
CREATE INDEX idx_medical_scales_status ON medical_scales (status);
CREATE INDEX idx_medical_scales_popularity ON medical_scales (popularity DESC);
CREATE INDEX idx_medical_scales_tags ON medical_scales USING GIN (tags);

-- Performance indexes
CREATE INDEX idx_scale_questions_scale_id ON scale_questions (scale_id);
CREATE INDEX idx_scale_questions_order ON scale_questions (scale_id, order_index);
CREATE INDEX idx_question_options_question_id ON question_options (question_id);
CREATE INDEX idx_question_options_order ON question_options (question_id, order_index);

-- Assessment indexes
CREATE INDEX idx_assessments_scale_user ON scale_assessments (scale_id, user_id);
CREATE INDEX idx_assessments_patient ON scale_assessments (patient_id);
CREATE INDEX idx_assessments_date ON scale_assessments (assessment_date DESC);
CREATE INDEX idx_assessments_status ON scale_assessments (status);

-- Analytics indexes
CREATE INDEX idx_usage_metrics_scale_date ON scale_usage_metrics (scale_id, date DESC);
CREATE INDEX idx_usage_metrics_date ON scale_usage_metrics (date DESC);

-- Security indexes
CREATE INDEX idx_audit_logs_user_timestamp ON security_audit_logs (user_id, timestamp DESC);
CREATE INDEX idx_audit_logs_event_type ON security_audit_logs (event_type);
CREATE INDEX idx_access_logs_user_accessed ON data_access_logs (user_id, accessed_at DESC);
CREATE INDEX idx_access_logs_resource ON data_access_logs (resource_type, resource_id);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Update timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that need updated_at
CREATE TRIGGER tr_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_medical_scales_updated_at BEFORE UPDATE ON medical_scales FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_scale_questions_updated_at BEFORE UPDATE ON scale_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_scale_scoring_updated_at BEFORE UPDATE ON scale_scoring FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_scale_assessments_updated_at BEFORE UPDATE ON scale_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update search vector for full-text search
CREATE OR REPLACE FUNCTION update_scale_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('spanish', COALESCE(NEW.name, '')), 'A') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.acronym, '')), 'A') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.category, '')), 'C') ||
        setweight(to_tsvector('spanish', COALESCE(NEW.specialty, '')), 'C') ||
        setweight(to_tsvector('spanish', COALESCE(array_to_string(NEW.tags, ' '), '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_medical_scales_search_vector 
    BEFORE INSERT OR UPDATE ON medical_scales 
    FOR EACH ROW EXECUTE FUNCTION update_scale_search_vector();

-- Update scale statistics
CREATE OR REPLACE FUNCTION update_scale_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment assessment count
        UPDATE medical_scales 
        SET assessment_count = assessment_count + 1,
            last_used_at = NOW()
        WHERE id = NEW.scale_id;
        
        -- Update daily metrics
        INSERT INTO scale_usage_metrics (scale_id, date, assessments_started)
        VALUES (NEW.scale_id, CURRENT_DATE, 1)
        ON CONFLICT (scale_id, date) 
        DO UPDATE SET assessments_started = scale_usage_metrics.assessments_started + 1;
        
    ELSIF TG_OP = 'UPDATE' AND OLD.status != 'completed' AND NEW.status = 'completed' THEN
        -- Increment completed assessments
        INSERT INTO scale_usage_metrics (scale_id, date, assessments_completed)
        VALUES (NEW.scale_id, CURRENT_DATE, 1)
        ON CONFLICT (scale_id, date) 
        DO UPDATE SET assessments_completed = scale_usage_metrics.assessments_completed + 1;
        
        -- Update completion percentage calculation
        NEW.completion_percentage = 100.0;
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))::INTEGER;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_scale_assessments_stats 
    AFTER INSERT OR UPDATE ON scale_assessments 
    FOR EACH ROW EXECUTE FUNCTION update_scale_stats();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_scoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_ranges ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_logs ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Medical scales policies (public read for active scales)
CREATE POLICY "Public read access for active scales" ON medical_scales FOR SELECT USING (status = 'active');
CREATE POLICY "Practitioners can manage scales" ON medical_scales FOR ALL TO authenticated 
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('practitioner', 'admin'))
    );

-- Scale components inherit scale visibility
CREATE POLICY "Questions inherit scale visibility" ON scale_questions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM medical_scales WHERE id = scale_id AND status = 'active'));

CREATE POLICY "Options inherit question visibility" ON question_options FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM scale_questions sq 
        JOIN medical_scales ms ON sq.scale_id = ms.id 
        WHERE sq.id = question_id AND ms.status = 'active'
    ));

CREATE POLICY "Scoring inherit scale visibility" ON scale_scoring FOR SELECT 
    USING (EXISTS (SELECT 1 FROM medical_scales WHERE id = scale_id AND status = 'active'));

CREATE POLICY "Ranges inherit scoring visibility" ON scoring_ranges FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM scale_scoring ss 
        JOIN medical_scales ms ON ss.scale_id = ms.id 
        WHERE ss.id = scoring_id AND ms.status = 'active'
    ));

CREATE POLICY "References inherit scale visibility" ON scale_references FOR SELECT 
    USING (EXISTS (SELECT 1 FROM medical_scales WHERE id = scale_id AND status = 'active'));

-- Patient data policies (strict access control)
CREATE POLICY "Users can read own patients" ON patients FOR SELECT TO authenticated 
    USING (created_by = auth.uid());
CREATE POLICY "Users can create patients" ON patients FOR INSERT TO authenticated 
    WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can update own patients" ON patients FOR UPDATE TO authenticated 
    USING (created_by = auth.uid());

-- Assessment policies
CREATE POLICY "Users can read own assessments" ON scale_assessments FOR SELECT TO authenticated 
    USING (user_id = auth.uid());
CREATE POLICY "Users can create assessments" ON scale_assessments FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own assessments" ON scale_assessments FOR UPDATE TO authenticated 
    USING (user_id = auth.uid());

-- Favorites policies
CREATE POLICY "Users can manage own favorites" ON user_favorites FOR ALL TO authenticated 
    USING (user_id = auth.uid());

-- Audit policies (read-only for users, write for system)
CREATE POLICY "Users can read own audit logs" ON data_access_logs FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

-- =====================================================
-- INITIAL DATA AND CONFIGURATION
-- =====================================================

-- Insert system settings
INSERT INTO system_settings (key, value, description, category) VALUES
('app.version', '"2.0.0"', 'Current application version', 'general'),
('security.session_timeout_minutes', '30', 'Session timeout in minutes', 'security'),
('features.offline_mode', 'true', 'Enable offline mode', 'features'),
('features.pdf_export', 'true', 'Enable PDF export functionality', 'features'),
('features.bulk_import', 'true', 'Enable bulk scale import', 'features'),
('analytics.enabled', 'true', 'Enable usage analytics', 'analytics'),
('hipaa.data_retention_years', '7', 'Data retention period in years', 'compliance'),
('search.max_results', '100', 'Maximum search results per page', 'performance');

-- Insert default categories
INSERT INTO medical_scales (id, name, acronym, description, category, status, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'Categoría Funcional', 'FUNC', 'Escalas que evalúan la capacidad funcional y actividades de la vida diaria', 'Funcional', 'active', NOW()),
('00000000-0000-0000-0000-000000000002', 'Categoría Neurológica', 'NEURO', 'Escalas para evaluación neurológica y cognitiva', 'Neurológica', 'active', NOW()),
('00000000-0000-0000-0000-000000000003', 'Categoría Psiquiátrica', 'PSI', 'Escalas de evaluación psiquiátrica y salud mental', 'Psiquiátrica', 'active', NOW()),
('00000000-0000-0000-0000-000000000004', 'Categoría Dolor', 'DOLOR', 'Escalas de evaluación del dolor', 'Dolor', 'active', NOW()),
('00000000-0000-0000-0000-000000000005', 'Categoría Cardiovascular', 'CARDIO', 'Evaluaciones cardiovasculares y riesgo cardíaco', 'Cardiovascular', 'active', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create admin functions for data management
CREATE OR REPLACE FUNCTION apply_data_retention_policies()
RETURNS TABLE(records_affected INTEGER) AS $$
DECLARE
    retention_years INTEGER;
    cutoff_date DATE;
BEGIN
    -- Get retention period from settings
    SELECT (value::INTEGER) INTO retention_years 
    FROM system_settings 
    WHERE key = 'hipaa.data_retention_years';
    
    IF retention_years IS NULL THEN
        retention_years := 7; -- Default
    END IF;
    
    cutoff_date := CURRENT_DATE - (retention_years || ' years')::INTERVAL;
    
    -- Archive old assessments (don't delete, just mark)
    WITH archived AS (
        UPDATE scale_assessments 
        SET status = 'archived'
        WHERE assessment_date < cutoff_date 
        AND status != 'archived'
        RETURNING 1
    )
    SELECT COUNT(*)::INTEGER INTO records_affected FROM archived;
    
    RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant appropriate permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE ON profiles, patients, scale_assessments, user_favorites TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE medical_scales IS 'Core medical scales repository with full metadata';
COMMENT ON TABLE scale_assessments IS 'Individual scale evaluations with HIPAA compliance';
COMMENT ON TABLE patients IS 'Patient data with anonymization support';
COMMENT ON TABLE security_audit_logs IS 'Security events log for HIPAA audit trail';
COMMENT ON TABLE data_access_logs IS 'Data access log for HIPAA compliance';

-- Final optimization
ANALYZE;