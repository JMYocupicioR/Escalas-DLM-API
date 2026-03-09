-- Medical Taxonomy System
-- Adds predefined taxonomies for better scale classification and search
-- Version: 1.0.0

-- =====================================================
-- DROP EXISTING TABLES (if any)
-- =====================================================

DROP TABLE IF EXISTS scale_scale_types CASCADE;
DROP TABLE IF EXISTS scale_populations CASCADE;
DROP TABLE IF EXISTS scale_conditions CASCADE;
DROP TABLE IF EXISTS scale_body_systems CASCADE;
DROP TABLE IF EXISTS scale_specialties CASCADE;
DROP TABLE IF EXISTS scale_medical_categories CASCADE;

DROP TABLE IF EXISTS scale_types CASCADE;
DROP TABLE IF EXISTS target_populations CASCADE;
DROP TABLE IF EXISTS medical_conditions CASCADE;
DROP TABLE IF EXISTS body_systems CASCADE;
DROP TABLE IF EXISTS medical_specialties CASCADE;
DROP TABLE IF EXISTS medical_categories CASCADE;

-- =====================================================
-- TAXONOMY TABLES
-- =====================================================

-- 1. Medical Categories (Main classification)
CREATE TABLE medical_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    icon TEXT, -- Lucide icon name
    color TEXT DEFAULT '#3b82f6',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Medical Specialties
CREATE TABLE medical_specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    parent_specialty_id UUID REFERENCES medical_specialties(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Body Systems
CREATE TABLE body_systems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Medical Conditions/Pathologies
CREATE TABLE medical_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    icd_10_code TEXT,
    snomed_code TEXT,
    category_id UUID REFERENCES medical_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Target Populations
CREATE TABLE target_populations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    age_range TEXT, -- e.g., "0-17", "18-64", "65+"
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Scale Types
CREATE TABLE scale_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    name_es TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MANY-TO-MANY RELATIONSHIP TABLES
-- =====================================================

-- Scales <-> Categories
CREATE TABLE scale_medical_categories (
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    category_id UUID REFERENCES medical_categories(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (scale_id, category_id)
);

-- Scales <-> Specialties
CREATE TABLE scale_specialties (
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    specialty_id UUID REFERENCES medical_specialties(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (scale_id, specialty_id)
);

-- Scales <-> Body Systems
CREATE TABLE scale_body_systems (
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    system_id UUID REFERENCES body_systems(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (scale_id, system_id)
);

-- Scales <-> Conditions
CREATE TABLE scale_conditions (
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    condition_id UUID REFERENCES medical_conditions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (scale_id, condition_id)
);

-- Scales <-> Populations
CREATE TABLE scale_populations (
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    population_id UUID REFERENCES target_populations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (scale_id, population_id)
);

-- Scales <-> Types
CREATE TABLE scale_scale_types (
    scale_id UUID REFERENCES medical_scales(id) ON DELETE CASCADE,
    type_id UUID REFERENCES scale_types(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (scale_id, type_id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_medical_categories_name ON medical_categories(name);
CREATE INDEX IF NOT EXISTS idx_medical_categories_active ON medical_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_medical_specialties_name ON medical_specialties(name);
CREATE INDEX IF NOT EXISTS idx_medical_specialties_active ON medical_specialties(is_active);
CREATE INDEX IF NOT EXISTS idx_body_systems_name ON body_systems(name);
CREATE INDEX IF NOT EXISTS idx_body_systems_active ON body_systems(is_active);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_name ON medical_conditions(name);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_icd ON medical_conditions(icd_10_code);
CREATE INDEX IF NOT EXISTS idx_medical_conditions_active ON medical_conditions(is_active);
CREATE INDEX IF NOT EXISTS idx_target_populations_name ON target_populations(name);
CREATE INDEX IF NOT EXISTS idx_target_populations_active ON target_populations(is_active);
CREATE INDEX IF NOT EXISTS idx_scale_types_name ON scale_types(name);
CREATE INDEX IF NOT EXISTS idx_scale_types_active ON scale_types(is_active);

-- Relationship table indexes
CREATE INDEX IF NOT EXISTS idx_scale_categories_scale ON scale_medical_categories(scale_id);
CREATE INDEX IF NOT EXISTS idx_scale_categories_category ON scale_medical_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_scale_specialties_scale ON scale_specialties(scale_id);
CREATE INDEX IF NOT EXISTS idx_scale_specialties_specialty ON scale_specialties(specialty_id);
CREATE INDEX IF NOT EXISTS idx_scale_body_systems_scale ON scale_body_systems(scale_id);
CREATE INDEX IF NOT EXISTS idx_scale_body_systems_system ON scale_body_systems(system_id);
CREATE INDEX IF NOT EXISTS idx_scale_conditions_scale ON scale_conditions(scale_id);
CREATE INDEX IF NOT EXISTS idx_scale_conditions_condition ON scale_conditions(condition_id);
CREATE INDEX IF NOT EXISTS idx_scale_populations_scale ON scale_populations(scale_id);
CREATE INDEX IF NOT EXISTS idx_scale_populations_population ON scale_populations(population_id);
CREATE INDEX IF NOT EXISTS idx_scale_types_scale ON scale_scale_types(scale_id);
CREATE INDEX IF NOT EXISTS idx_scale_types_type ON scale_scale_types(type_id);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Medical Categories
INSERT INTO medical_categories (name, name_es, name_en, icon, color, display_order) VALUES
('neurology', 'Neurología', 'Neurology', 'Brain', '#8b5cf6', 1),
('cardiology', 'Cardiología', 'Cardiology', 'Heart', '#ef4444', 2),
('geriatrics', 'Geriatría', 'Geriatrics', 'Users', '#f59e0b', 3),
('psychiatry', 'Psiquiatría', 'Psychiatry', 'Brain', '#06b6d4', 4),
('rehabilitation', 'Rehabilitación', 'Rehabilitation', 'Activity', '#10b981', 5),
('pediatrics', 'Pediatría', 'Pediatrics', 'Baby', '#ec4899', 6),
('oncology', 'Oncología', 'Oncology', 'Shield', '#6366f1', 7),
('pain_management', 'Manejo del Dolor', 'Pain Management', 'Zap', '#f97316', 8),
('emergency', 'Medicina de Emergencia', 'Emergency Medicine', 'AlertCircle', '#dc2626', 9),
('intensive_care', 'Cuidados Intensivos', 'Intensive Care', 'Activity', '#7c3aed', 10),
('palliative_care', 'Cuidados Paliativos', 'Palliative Care', 'Heart', '#64748b', 11)
ON CONFLICT (name) DO NOTHING;

-- Medical Specialties
INSERT INTO medical_specialties (name, name_es, name_en, display_order) VALUES
('neurology', 'Neurología', 'Neurology', 1),
('neuropsychology', 'Neuropsicología', 'Neuropsychology', 2),
('geriatrics', 'Geriatría', 'Geriatrics', 3),
('cardiology', 'Cardiología', 'Cardiology', 4),
('psychiatry', 'Psiquiatría', 'Psychiatry', 5),
('psychology', 'Psicología', 'Psychology', 6),
('physical_therapy', 'Fisioterapia', 'Physical Therapy', 7),
('occupational_therapy', 'Terapia Ocupacional', 'Occupational Therapy', 8),
('palliative_care', 'Cuidados Paliativos', 'Palliative Care', 9),
('internal_medicine', 'Medicina Interna', 'Internal Medicine', 10),
('family_medicine', 'Medicina Familiar', 'Family Medicine', 11),
('emergency_medicine', 'Medicina de Emergencia', 'Emergency Medicine', 12),
('critical_care', 'Cuidados Intensivos', 'Critical Care', 13),
('anesthesiology', 'Anestesiología', 'Anesthesiology', 14),
('oncology', 'Oncología', 'Oncology', 15),
('rheumatology', 'Reumatología', 'Rheumatology', 16),
('pulmonology', 'Neumología', 'Pulmonology', 17),
('gastroenterology', 'Gastroenterología', 'Gastroenterology', 18)
ON CONFLICT (name) DO NOTHING;

-- Body Systems
INSERT INTO body_systems (name, name_es, name_en, display_order) VALUES
('nervous', 'Sistema Nervioso', 'Nervous System', 1),
('cardiovascular', 'Sistema Cardiovascular', 'Cardiovascular System', 2),
('respiratory', 'Sistema Respiratorio', 'Respiratory System', 3),
('musculoskeletal', 'Sistema Musculoesquelético', 'Musculoskeletal System', 4),
('gastrointestinal', 'Sistema Gastrointestinal', 'Gastrointestinal System', 5),
('endocrine', 'Sistema Endocrino', 'Endocrine System', 6),
('genitourinary', 'Sistema Genitourinario', 'Genitourinary System', 7),
('integumentary', 'Sistema Tegumentario', 'Integumentary System', 8),
('immune', 'Sistema Inmunológico', 'Immune System', 9),
('mental_health', 'Salud Mental', 'Mental Health', 10)
ON CONFLICT (name) DO NOTHING;

-- Target Populations
INSERT INTO target_populations (name, name_es, name_en, age_range, display_order) VALUES
('neonatal', 'Neonatal', 'Neonatal', '0-28 días', 1),
('pediatric', 'Pediátrico', 'Pediatric', '0-17 años', 2),
('adolescent', 'Adolescente', 'Adolescent', '12-18 años', 3),
('adult', 'Adulto', 'Adult', '18-64 años', 4),
('geriatric', 'Geriátrico', 'Geriatric', '65+ años', 5),
('all_ages', 'Todas las edades', 'All Ages', NULL, 6)
ON CONFLICT (name) DO NOTHING;

-- Scale Types
INSERT INTO scale_types (name, name_es, name_en, display_order) VALUES
('diagnostic', 'Diagnóstica', 'Diagnostic', 1),
('severity', 'Severidad', 'Severity', 2),
('functional', 'Funcional', 'Functional', 3),
('screening', 'Tamizaje', 'Screening', 4),
('quality_of_life', 'Calidad de Vida', 'Quality of Life', 5),
('cognitive', 'Cognitiva', 'Cognitive', 6),
('pain', 'Dolor', 'Pain', 7),
('depression', 'Depresión', 'Depression', 8),
('anxiety', 'Ansiedad', 'Anxiety', 9),
('activities_daily_living', 'Actividades de la Vida Diaria', 'Activities of Daily Living', 10),
('mortality_risk', 'Riesgo de Mortalidad', 'Mortality Risk', 11),
('prognosis', 'Pronóstico', 'Prognosis', 12)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE medical_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_populations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_types ENABLE ROW LEVEL SECURITY;

-- Public read access for all taxonomy tables
CREATE POLICY "Public read access for categories" ON medical_categories FOR SELECT USING (TRUE);
CREATE POLICY "Public read access for specialties" ON medical_specialties FOR SELECT USING (TRUE);
CREATE POLICY "Public read access for body systems" ON body_systems FOR SELECT USING (TRUE);
CREATE POLICY "Public read access for conditions" ON medical_conditions FOR SELECT USING (TRUE);
CREATE POLICY "Public read access for populations" ON target_populations FOR SELECT USING (TRUE);
CREATE POLICY "Public read access for scale types" ON scale_types FOR SELECT USING (TRUE);

-- Only super admins can modify taxonomy tables
CREATE POLICY "Super admin can manage categories" ON medical_categories FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());
    
CREATE POLICY "Super admin can manage specialties" ON medical_specialties FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());
    
CREATE POLICY "Super admin can manage body systems" ON body_systems FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());
    
CREATE POLICY "Super admin can manage conditions" ON medical_conditions FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());
    
CREATE POLICY "Super admin can manage populations" ON target_populations FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());
    
CREATE POLICY "Super admin can manage scale types" ON scale_types FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());

-- RLS for relationship tables (inherit from medical_scales policies)
ALTER TABLE scale_medical_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_body_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_populations ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_scale_types ENABLE ROW LEVEL SECURITY;

-- Public can read scale taxonomies
CREATE POLICY "Public read scale categories" ON scale_medical_categories FOR SELECT USING (TRUE);
CREATE POLICY "Public read scale specialties" ON scale_specialties FOR SELECT USING (TRUE);
CREATE POLICY "Public read scale body systems" ON scale_body_systems FOR SELECT USING (TRUE);
CREATE POLICY "Public read scale conditions" ON scale_conditions FOR SELECT USING (TRUE);
CREATE POLICY "Public read scale populations" ON scale_populations FOR SELECT USING (TRUE);
CREATE POLICY "Public read scale types" ON scale_scale_types FOR SELECT USING (TRUE);

-- Super admins can modify scale taxonomies
CREATE POLICY "Super admin manage scale categories" ON scale_medical_categories FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());
    
CREATE POLICY "Super admin manage scale specialties" ON scale_specialties FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());
    
CREATE POLICY "Super admin manage scale body systems" ON scale_body_systems FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());
    
CREATE POLICY "Super admin manage scale conditions" ON scale_conditions FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());
    
CREATE POLICY "Super admin manage scale populations" ON scale_populations FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());
    
CREATE POLICY "Super admin manage scale types" ON scale_scale_types FOR ALL 
    USING (is_super_admin()) WITH CHECK (is_super_admin());

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE medical_categories IS 'Main medical classification categories';
COMMENT ON TABLE medical_specialties IS 'Medical specialties and subspecialties';
COMMENT ON TABLE body_systems IS 'Human body systems';
COMMENT ON TABLE medical_conditions IS 'Medical conditions and pathologies with ICD-10 codes';
COMMENT ON TABLE target_populations IS 'Target patient populations by age range';
COMMENT ON TABLE scale_types IS 'Types of medical scales (diagnostic, functional, etc.)';
