# 🚀 Sprint 1: Backend Foundation & API
## Guía de Implementación Detallada (Semanas 1-4)

> **Objetivo:** Establecer infraestructura backend robusta y API REST funcional
> **Duración:** 4 semanas (160 horas)
> **Team:** Backend Dev (1.0 FTE) + DevOps (0.25 FTE)

---

## 📅 Cronograma Semanal

```
Week 1: Setup & Database Foundation
Week 2: API Core & Authentication
Week 3: Endpoints Development
Week 4: Testing & Documentation
```

---

## 🗓️ WEEK 1: Setup & Database Foundation

### Day 1-2: Project Setup (16h)

#### ✅ Task 1.1: Supabase Production Setup (6h)
**Priority:** 🔴 CRITICAL

**Subtasks:**
```bash
# 1. Create Supabase project (production)
- [ ] Sign up/login to Supabase
- [ ] Create new project: "escalas-dlm-prod"
- [ ] Select region: South America (São Paulo) or closest
- [ ] Note down: project URL, anon key, service role key
- [ ] Enable database webhooks
- [ ] Configure connection pooling (recommended: session mode)

# 2. Setup environment variables
- [ ] Create .env.production file
- [ ] Add SUPABASE_URL
- [ ] Add SUPABASE_ANON_KEY
- [ ] Add SUPABASE_SERVICE_ROLE_KEY (secure!)
- [ ] Add JWT_SECRET
- [ ] Add DATABASE_URL (for migrations)

# 3. Configure project settings
- [ ] Enable email confirmations
- [ ] Configure redirect URLs for auth
- [ ] Setup SMTP for emails (or use Supabase default)
- [ ] Enable RLS (Row Level Security) by default
- [ ] Set up storage buckets (patient-photos, exports)
```

**Acceptance Criteria:**
- ✅ Supabase project accessible
- ✅ Environment variables documented
- ✅ Connection successful from local environment

---

#### ✅ Task 1.2: Database Schema Design (10h)
**Priority:** 🔴 CRITICAL

**Schema SQL:**

```sql
-- ============================================================================
-- ESCALAS DLM - DATABASE SCHEMA v1.0
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: medical_scales
-- Description: Main catalog of all medical scales
-- ============================================================================
CREATE TABLE medical_scales (
    id TEXT PRIMARY KEY,                           -- e.g., "katz", "barthel"
    name TEXT NOT NULL,
    short_name TEXT,
    description TEXT,

    -- Categorization
    category TEXT NOT NULL,                        -- e.g., "functional", "cognitive"
    specialty TEXT,                                -- e.g., "geriatrics", "neurology"
    target_population TEXT[],                      -- e.g., ["adult", "geriatric"]

    -- Application context
    application_time_minutes INTEGER,
    complexity TEXT CHECK (complexity IN ('low', 'medium', 'high')),
    requires_equipment BOOLEAN DEFAULT FALSE,
    equipment_needed TEXT[],

    -- Scoring
    scoring_method TEXT NOT NULL,                  -- e.g., "sum", "weighted", "algorithm"
    min_score NUMERIC,
    max_score NUMERIC,
    score_interpretation JSONB,                    -- Array of range objects

    -- Clinical info
    purpose TEXT,
    indications TEXT[],
    contraindications TEXT[],

    -- Metadata
    version TEXT DEFAULT '1.0',
    language TEXT DEFAULT 'es',
    published BOOLEAN DEFAULT TRUE,
    featured BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(name, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(description, '')), 'B')
    ) STORED
);

-- Indexes for performance
CREATE INDEX idx_medical_scales_category ON medical_scales(category);
CREATE INDEX idx_medical_scales_specialty ON medical_scales(specialty);
CREATE INDEX idx_medical_scales_published ON medical_scales(published);
CREATE INDEX idx_medical_scales_search ON medical_scales USING GIN(search_vector);

-- ============================================================================
-- TABLE: scale_questions
-- Description: Questions for each scale
-- ============================================================================
CREATE TABLE scale_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id TEXT NOT NULL REFERENCES medical_scales(id) ON DELETE CASCADE,

    -- Question details
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL CHECK (
        question_type IN (
            'single_choice',
            'multiple_choice',
            'numeric_input',
            'text_input',
            'boolean',
            'slider',
            'date',
            'time'
        )
    ),

    -- Conditional logic
    parent_question_id UUID REFERENCES scale_questions(id),
    show_if_condition JSONB,                       -- e.g., {"parent_answer": "yes"}

    -- Validation
    required BOOLEAN DEFAULT TRUE,
    validation_rules JSONB,                        -- e.g., {"min": 0, "max": 100}

    -- UI hints
    help_text TEXT,
    placeholder TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(scale_id, question_number)
);

CREATE INDEX idx_scale_questions_scale_id ON scale_questions(scale_id);
CREATE INDEX idx_scale_questions_parent ON scale_questions(parent_question_id);

-- ============================================================================
-- TABLE: question_options
-- Description: Options for single/multiple choice questions
-- ============================================================================
CREATE TABLE question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES scale_questions(id) ON DELETE CASCADE,

    -- Option details
    option_value TEXT NOT NULL,
    option_label TEXT NOT NULL,
    option_order INTEGER NOT NULL,

    -- Scoring
    points NUMERIC DEFAULT 0,

    -- Metadata
    description TEXT,

    UNIQUE(question_id, option_value)
);

CREATE INDEX idx_question_options_question_id ON question_options(question_id);

-- ============================================================================
-- TABLE: scale_scoring_rules
-- Description: Complex scoring algorithms
-- ============================================================================
CREATE TABLE scale_scoring_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id TEXT NOT NULL REFERENCES medical_scales(id) ON DELETE CASCADE,

    -- Rule definition
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (
        rule_type IN ('sum', 'weighted_sum', 'average', 'custom_algorithm', 'subscore')
    ),
    rule_formula TEXT,                             -- e.g., "q1 * 2 + q2 - q3"
    questions_involved UUID[],

    -- Subscore (for multi-dimensional scales)
    is_subscore BOOLEAN DEFAULT FALSE,
    subscore_name TEXT,

    -- Metadata
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scale_scoring_rules_scale_id ON scale_scoring_rules(scale_id);

-- ============================================================================
-- TABLE: scale_references
-- Description: Scientific references for each scale
-- ============================================================================
CREATE TABLE scale_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scale_id TEXT NOT NULL REFERENCES medical_scales(id) ON DELETE CASCADE,

    -- Reference details
    reference_type TEXT CHECK (reference_type IN ('original', 'validation', 'review', 'guideline')),
    title TEXT NOT NULL,
    authors TEXT[],
    journal TEXT,
    year INTEGER,
    doi TEXT,
    pmid TEXT,
    url TEXT,

    -- Citation
    citation_text TEXT,                            -- Formatted citation

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scale_references_scale_id ON scale_references(scale_id);

-- ============================================================================
-- TABLE: patients
-- Description: Patient records
-- ============================================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID,                          -- Future: multi-tenancy

    -- Identifiers
    medical_record_number TEXT,
    external_id TEXT,                              -- For EMR integration

    -- Demographics
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE NOT NULL,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),

    -- Contact
    email TEXT,
    phone TEXT,
    address JSONB,                                 -- {street, city, state, zip, country}

    -- Clinical data
    allergies TEXT[],
    medications JSONB[],                           -- {name, dose, frequency, start_date}
    diagnoses JSONB[],                             -- {icd10, description, date}
    medical_history TEXT,

    -- Metadata
    photo_url TEXT,
    notes TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,                        -- Soft delete

    -- Constraints
    UNIQUE(user_id, medical_record_number)
);

-- Indexes
CREATE INDEX idx_patients_user_id ON patients(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_mrn ON patients(medical_record_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_patients_status ON patients(status) WHERE deleted_at IS NULL;

-- Full-text search
ALTER TABLE patients ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('spanish', coalesce(first_name, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(last_name, '')), 'A') ||
        setweight(to_tsvector('spanish', coalesce(medical_record_number, '')), 'B')
    ) STORED;

CREATE INDEX idx_patients_search ON patients USING GIN(search_vector);

-- ============================================================================
-- TABLE: scale_assessments
-- Description: Completed scale assessments
-- ============================================================================
CREATE TABLE scale_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Relations
    scale_id TEXT NOT NULL REFERENCES medical_scales(id),
    patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
    practitioner_id UUID NOT NULL REFERENCES auth.users(id),
    organization_id UUID,                          -- Future: multi-tenancy

    -- Assessment data
    responses JSONB NOT NULL,                      -- {question_id: answer_value}
    score NUMERIC,
    subscores JSONB,                               -- {subscore_name: value}
    interpretation TEXT,
    interpretation_category TEXT,                  -- e.g., "normal", "mild", "severe"

    -- Clinical context
    assessment_date TIMESTAMPTZ DEFAULT NOW(),
    location TEXT,
    duration_minutes INTEGER,
    notes TEXT,

    -- Status
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'verified', 'archived')),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id)
);

-- Indexes
CREATE INDEX idx_scale_assessments_patient_id ON scale_assessments(patient_id);
CREATE INDEX idx_scale_assessments_practitioner_id ON scale_assessments(practitioner_id);
CREATE INDEX idx_scale_assessments_scale_id ON scale_assessments(scale_id);
CREATE INDEX idx_scale_assessments_date ON scale_assessments(assessment_date DESC);
CREATE INDEX idx_scale_assessments_status ON scale_assessments(status);

-- ============================================================================
-- TABLE: user_favorites
-- Description: User's favorite scales
-- ============================================================================
CREATE TABLE user_favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scale_id TEXT NOT NULL REFERENCES medical_scales(id) ON DELETE CASCADE,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, scale_id)
);

CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);

-- ============================================================================
-- TABLE: scale_usage_metrics
-- Description: Analytics and usage tracking
-- ============================================================================
CREATE TABLE scale_usage_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    scale_id TEXT NOT NULL REFERENCES medical_scales(id),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Event tracking
    event_type TEXT NOT NULL CHECK (
        event_type IN ('view', 'start', 'complete', 'export', 'share')
    ),
    event_data JSONB,                              -- Additional context

    -- Session info
    session_id TEXT,
    device_type TEXT,
    platform TEXT,

    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX idx_scale_usage_metrics_scale_id ON scale_usage_metrics(scale_id);
CREATE INDEX idx_scale_usage_metrics_user_id ON scale_usage_metrics(user_id);
CREATE INDEX idx_scale_usage_metrics_event ON scale_usage_metrics(event_type);
CREATE INDEX idx_scale_usage_metrics_date ON scale_usage_metrics(created_at DESC);

-- ============================================================================
-- TABLE: user_profiles
-- Description: Extended user information
-- ============================================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Professional info
    full_name TEXT,
    professional_title TEXT,
    specialty TEXT,
    license_number TEXT,
    organization TEXT,

    -- Contact
    phone TEXT,

    -- Preferences
    language TEXT DEFAULT 'es',
    timezone TEXT DEFAULT 'America/Mexico_City',
    theme TEXT DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
    preferences JSONB,                             -- UI preferences

    -- Metadata
    avatar_url TEXT,
    bio TEXT,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE medical_scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE scale_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Medical scales: Public read, admin write
CREATE POLICY "Scales are viewable by everyone" ON medical_scales
    FOR SELECT USING (published = true);

CREATE POLICY "Admins can manage scales" ON medical_scales
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin'
    );

-- Patients: Users can only see their own patients
CREATE POLICY "Users can view own patients" ON patients
    FOR SELECT USING (
        auth.uid() = user_id AND deleted_at IS NULL
    );

CREATE POLICY "Users can create own patients" ON patients
    FOR INSERT WITH CHECK (
        auth.uid() = user_id
    );

CREATE POLICY "Users can update own patients" ON patients
    FOR UPDATE USING (
        auth.uid() = user_id AND deleted_at IS NULL
    );

CREATE POLICY "Users can soft-delete own patients" ON patients
    FOR DELETE USING (
        auth.uid() = user_id
    );

-- Assessments: Users can see assessments they created or for their patients
CREATE POLICY "Users can view own assessments" ON scale_assessments
    FOR SELECT USING (
        auth.uid() = practitioner_id OR
        patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create assessments" ON scale_assessments
    FOR INSERT WITH CHECK (
        auth.uid() = practitioner_id
    );

CREATE POLICY "Users can update own assessments" ON scale_assessments
    FOR UPDATE USING (
        auth.uid() = practitioner_id
    );

-- Favorites: Users can manage their own favorites
CREATE POLICY "Users can manage own favorites" ON user_favorites
    FOR ALL USING (
        auth.uid() = user_id
    );

-- User profiles: Users can view all, manage own
CREATE POLICY "Profiles are viewable by authenticated users" ON user_profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (
        auth.uid() = id
    );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_medical_scales_updated_at
    BEFORE UPDATE ON medical_scales
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scale_assessments_updated_at
    BEFORE UPDATE ON scale_assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function: Create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, full_name)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Create profile on new user
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function: Soft delete patients
CREATE OR REPLACE FUNCTION soft_delete_patient()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE patients
    SET deleted_at = NOW()
    WHERE id = OLD.id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Replace DELETE with soft delete for patients
-- Note: This will be handled in application logic instead

-- ============================================================================
-- MATERIALIZED VIEWS FOR ANALYTICS
-- ============================================================================

CREATE MATERIALIZED VIEW scale_popularity AS
SELECT
    s.id,
    s.name,
    s.category,
    COUNT(DISTINCT a.id) as total_assessments,
    COUNT(DISTINCT a.practitioner_id) as unique_users,
    COUNT(DISTINCT CASE WHEN a.created_at >= NOW() - INTERVAL '30 days' THEN a.id END) as assessments_last_30d,
    AVG(a.duration_minutes) as avg_duration_minutes,
    MAX(a.created_at) as last_used_at
FROM medical_scales s
LEFT JOIN scale_assessments a ON s.id = a.scale_id
WHERE s.published = true
GROUP BY s.id, s.name, s.category;

CREATE UNIQUE INDEX idx_scale_popularity_id ON scale_popularity(id);

-- Refresh function (call daily via cron)
CREATE OR REPLACE FUNCTION refresh_scale_popularity()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY scale_popularity;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- SAMPLE DATA (for development/testing)
-- ============================================================================

-- Insert sample user (replace with your test user ID)
-- INSERT INTO auth.users (id, email) VALUES
--     ('00000000-0000-0000-0000-000000000001', 'test@example.com');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
```

**Acceptance Criteria:**
- ✅ All tables created successfully
- ✅ RLS policies active
- ✅ Indexes created
- ✅ Triggers working
- ✅ Can query from Supabase dashboard

---

### Day 3-4: API Foundation (16h)

#### ✅ Task 1.3: API Project Structure (8h)
**Priority:** 🔴 CRITICAL

**Directory structure:**
```
api/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   ├── database.ts          # Supabase client
│   │   ├── constants.ts         # App constants
│   │   └── env.ts               # Environment validation
│   ├── middleware/
│   │   ├── auth.ts              # JWT validation
│   │   ├── errorHandler.ts     # Global error handling
│   │   ├── rateLimit.ts         # Rate limiting
│   │   └── validation.ts        # Request validation
│   ├── routes/
│   │   ├── index.ts             # Route aggregator
│   │   ├── scales.ts            # /api/v1/scales/*
│   │   ├── assessments.ts       # /api/v1/assessments/*
│   │   ├── patients.ts          # /api/v1/patients/*
│   │   ├── favorites.ts         # /api/v1/favorites/*
│   │   └── auth.ts              # /api/v1/auth/*
│   ├── controllers/
│   │   ├── scalesController.ts
│   │   ├── assessmentsController.ts
│   │   ├── patientsController.ts
│   │   └── authController.ts
│   ├── services/
│   │   ├── scaleService.ts      # Business logic
│   │   ├── assessmentService.ts
│   │   ├── patientService.ts
│   │   └── scoringService.ts    # Scale scoring engine
│   ├── models/
│   │   ├── Scale.ts
│   │   ├── Assessment.ts
│   │   └── Patient.ts
│   ├── types/
│   │   ├── api.types.ts
│   │   ├── scale.types.ts
│   │   └── assessment.types.ts
│   ├── utils/
│   │   ├── logger.ts            # Winston/Pino logger
│   │   ├── responses.ts         # Standardized responses
│   │   └── validators.ts        # Zod schemas
│   └── tests/
│       ├── unit/
│       ├── integration/
│       └── e2e/
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

**Implementation (TypeScript):**

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  RATE_LIMIT_WINDOW_MS: z.string().default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
});

export const env = envSchema.parse(process.env);

// src/config/database.ts
import { createClient } from '@supabase/supabase-js';
import { env } from './env';

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_ANON_KEY
);

export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// src/utils/responses.ts
export class ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };

  constructor(success: boolean, data?: T, error?: any, meta?: any) {
    this.success = success;
    if (data !== undefined) this.data = data;
    if (error !== undefined) this.error = error;
    if (meta !== undefined) this.meta = meta;
  }

  static success<T>(data: T, meta?: any): ApiResponse<T> {
    return new ApiResponse(true, data, undefined, meta);
  }

  static error(code: string, message: string, details?: any): ApiResponse {
    return new ApiResponse(false, undefined, { code, message, details });
  }
}

// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/responses';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json(
      ApiResponse.error(err.code, err.message, err.details)
    );
  }

  // Unhandled errors
  return res.status(500).json(
    ApiResponse.error('INTERNAL_SERVER_ERROR', 'An unexpected error occurred')
  );
};

// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config/database';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Missing or invalid authorization header');
    }

    const token = authHeader.substring(7);

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token');
    }

    req.user = {
      id: user.id,
      email: user.email!,
      role: user.user_metadata?.role || 'practitioner'
    };

    next();
  } catch (error) {
    next(error);
  }
};

// src/index.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/v1', routes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT);
app.listen(PORT, () => {
  logger.info(`🚀 API server running on port ${PORT}`);
  logger.info(`Environment: ${env.NODE_ENV}`);
});
```

**Acceptance Criteria:**
- ✅ Express server running
- ✅ Health check endpoint works
- ✅ Error handling middleware active
- ✅ TypeScript compiling without errors

---

#### ✅ Task 1.4: Authentication System (8h)
**Priority:** 🔴 CRITICAL

**Implementation:**

```typescript
// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/database';
import { ApiResponse } from '../utils/responses';
import { AppError } from '../middleware/errorHandler';
import { z } from 'zod';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  professionalTitle: z.string().optional(),
  specialty: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = signupSchema.parse(req.body);

    const { data, error } = await supabase.auth.signUp({
      email: body.email,
      password: body.password,
      options: {
        data: {
          full_name: body.fullName,
          professional_title: body.professionalTitle,
          specialty: body.specialty,
        }
      }
    });

    if (error) throw new AppError(400, 'SIGNUP_FAILED', error.message);

    res.status(201).json(ApiResponse.success({
      user: {
        id: data.user?.id,
        email: data.user?.email,
      },
      session: data.session,
      message: 'Please check your email to confirm your account'
    }));
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = loginSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) throw new AppError(401, 'LOGIN_FAILED', error.message);

    res.json(ApiResponse.success({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'practitioner',
      },
      session: data.session,
    }));
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw new AppError(400, 'LOGOUT_FAILED', error.message);

    res.json(ApiResponse.success({ message: 'Logged out successfully' }));
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.APP_URL}/reset-password`,
    });

    if (error) throw new AppError(400, 'PASSWORD_RESET_FAILED', error.message);

    res.json(ApiResponse.success({
      message: 'Password reset email sent'
    }));
  } catch (error) {
    next(error);
  }
};

// src/routes/auth.ts
import { Router } from 'express';
import * as authController from '../controllers/authController';

const router = Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgot-password', authController.forgotPassword);

export default router;
```

**Tests:**

```typescript
// src/tests/integration/auth.test.ts
import request from 'supertest';
import { app } from '../../index';

describe('Authentication', () => {
  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!',
          fullName: 'Dr. Test User',
          specialty: 'geriatrics'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
    });

    it('should reject invalid email', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'password123',
          fullName: 'Test'
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login existing user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.session).toBeDefined();
    });

    it('should reject wrong password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
    });
  });
});
```

**Acceptance Criteria:**
- ✅ Signup creates user in Supabase
- ✅ Login returns JWT token
- ✅ Password reset sends email
- ✅ All tests passing

---

### Day 5: Documentation Setup (8h)

#### ✅ Task 1.5: OpenAPI/Swagger Documentation (8h)
**Priority:** 🟡 MEDIUM

**Installation:**
```bash
npm install swagger-ui-express swagger-jsdoc @types/swagger-ui-express
```

**Implementation:**

```typescript
// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Escalas DLM API',
      version: '1.0.0',
      description: 'API for medical scales and assessments',
      contact: {
        name: 'API Support',
        email: 'support@escalas-dlm.com'
      },
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.escalas-dlm.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: {
              type: 'object',
              properties: {
                code: { type: 'string' },
                message: { type: 'string' },
                details: { type: 'object' }
              }
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' }
              }
            }
          }
        },
        Scale: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'katz' },
            name: { type: 'string', example: 'Índice de Katz' },
            description: { type: 'string' },
            category: { type: 'string', example: 'functional' },
            specialty: { type: 'string', example: 'geriatrics' },
            applicationTimeMinutes: { type: 'number', example: 5 },
            minScore: { type: 'number' },
            maxScore: { type: 'number' },
          }
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            dateOfBirth: { type: 'string', format: 'date' },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other', 'prefer_not_to_say']
            },
            medicalRecordNumber: { type: 'string' },
            status: { type: 'string', enum: ['active', 'inactive', 'archived'] }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);

// src/index.ts (add to existing file)
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';

// ... existing code ...

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

**Add JSDoc comments to routes:**

```typescript
// src/routes/scales.ts

/**
 * @openapi
 * /scales:
 *   get:
 *     summary: Get all medical scales
 *     tags: [Scales]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', scalesController.getAllScales);
```

**Acceptance Criteria:**
- ✅ Swagger UI accessible at /api-docs
- ✅ All endpoints documented
- ✅ Request/response schemas defined
- ✅ Authentication documented

---

## 🗓️ WEEK 2: API Core & Scales Endpoints

### Day 6-7: Scales API (16h)

#### ✅ Task 2.1: Scales Controller & Service (16h)
**Priority:** 🔴 CRITICAL

**Implementation:**

```typescript
// src/services/scaleService.ts
import { supabaseAdmin } from '../config/database';
import { AppError } from '../middleware/errorHandler';

export interface ScaleFilters {
  category?: string;
  specialty?: string;
  search?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export class ScaleService {
  async getAllScales(filters: ScaleFilters) {
    const {
      category,
      specialty,
      search,
      featured,
      page = 1,
      limit = 20
    } = filters;

    let query = supabaseAdmin
      .from('medical_scales')
      .select('*', { count: 'exact' })
      .eq('published', true);

    // Apply filters
    if (category) query = query.eq('category', category);
    if (specialty) query = query.eq('specialty', specialty);
    if (featured !== undefined) query = query.eq('featured', featured);

    // Full-text search
    if (search) {
      query = query.textSearch('search_vector', search, {
        type: 'websearch',
        config: 'spanish'
      });
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) throw new AppError(500, 'DATABASE_ERROR', error.message);

    return {
      scales: data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  }

  async getScaleById(scaleId: string, includeQuestions = false) {
    // Get scale
    const { data: scale, error } = await supabaseAdmin
      .from('medical_scales')
      .select('*')
      .eq('id', scaleId)
      .single();

    if (error || !scale) {
      throw new AppError(404, 'SCALE_NOT_FOUND', `Scale ${scaleId} not found`);
    }

    if (!includeQuestions) {
      return scale;
    }

    // Get questions with options
    const { data: questions, error: questionsError } = await supabaseAdmin
      .from('scale_questions')
      .select(`
        *,
        question_options (*)
      `)
      .eq('scale_id', scaleId)
      .order('question_number');

    if (questionsError) {
      throw new AppError(500, 'DATABASE_ERROR', questionsError.message);
    }

    // Get references
    const { data: references } = await supabaseAdmin
      .from('scale_references')
      .select('*')
      .eq('scale_id', scaleId);

    return {
      ...scale,
      questions,
      references
    };
  }

  async getPopularScales(limit = 10) {
    const { data, error } = await supabaseAdmin
      .from('scale_popularity')
      .select('*')
      .order('total_assessments', { ascending: false })
      .limit(limit);

    if (error) throw new AppError(500, 'DATABASE_ERROR', error.message);

    return data;
  }

  async getCategories() {
    const { data, error } = await supabaseAdmin
      .from('medical_scales')
      .select('category')
      .eq('published', true);

    if (error) throw new AppError(500, 'DATABASE_ERROR', error.message);

    const categories = [...new Set(data.map(s => s.category))];
    return categories;
  }

  async trackUsage(scaleId: string, userId: string | null, eventType: string) {
    await supabaseAdmin
      .from('scale_usage_metrics')
      .insert({
        scale_id: scaleId,
        user_id: userId,
        event_type: eventType,
      });
  }
}

// src/controllers/scalesController.ts
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ScaleService } from '../services/scaleService';
import { ApiResponse } from '../utils/responses';

const scaleService = new ScaleService();

export const getAllScales = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = {
      category: req.query.category as string,
      specialty: req.query.specialty as string,
      search: req.query.search as string,
      featured: req.query.featured === 'true',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    };

    const result = await scaleService.getAllScales(filters);

    res.json(ApiResponse.success(result.scales, result.pagination));
  } catch (error) {
    next(error);
  }
};

export const getScaleById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const includeQuestions = req.query.includeQuestions === 'true';

    const scale = await scaleService.getScaleById(id, includeQuestions);

    // Track usage
    if (req.user) {
      await scaleService.trackUsage(id, req.user.id, 'view');
    }

    res.json(ApiResponse.success(scale));
  } catch (error) {
    next(error);
  }
};

export const getPopular = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const scales = await scaleService.getPopularScales(limit);

    res.json(ApiResponse.success(scales));
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await scaleService.getCategories();
    res.json(ApiResponse.success(categories));
  } catch (error) {
    next(error);
  }
};

// src/routes/scales.ts
import { Router } from 'express';
import * as scalesController from '../controllers/scalesController';

const router = Router();

router.get('/', scalesController.getAllScales);
router.get('/popular', scalesController.getPopular);
router.get('/categories', scalesController.getCategories);
router.get('/:id', scalesController.getScaleById);

export default router;
```

**Tests:**

```typescript
// src/tests/integration/scales.test.ts
import request from 'supertest';
import { app } from '../../index';

describe('Scales API', () => {
  describe('GET /api/v1/scales', () => {
    it('should return paginated scales', async () => {
      const response = await request(app)
        .get('/api/v1/scales')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.meta).toHaveProperty('total');
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/v1/scales')
        .query({ category: 'functional' });

      expect(response.status).toBe(200);
      response.body.data.forEach((scale: any) => {
        expect(scale.category).toBe('functional');
      });
    });

    it('should search scales', async () => {
      const response = await request(app)
        .get('/api/v1/scales')
        .query({ search: 'katz' });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/scales/:id', () => {
    it('should return scale details', async () => {
      const response = await request(app)
        .get('/api/v1/scales/katz');

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('katz');
    });

    it('should include questions when requested', async () => {
      const response = await request(app)
        .get('/api/v1/scales/katz')
        .query({ includeQuestions: 'true' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('questions');
      expect(Array.isArray(response.body.data.questions)).toBe(true);
    });

    it('should return 404 for non-existent scale', async () => {
      const response = await request(app)
        .get('/api/v1/scales/nonexistent');

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/scales/popular', () => {
    it('should return popular scales', async () => {
      const response = await request(app)
        .get('/api/v1/scales/popular')
        .query({ limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });
  });
});
```

**Acceptance Criteria:**
- ✅ All CRUD operations work
- ✅ Pagination functional
- ✅ Search returns relevant results
- ✅ Tests passing (>80% coverage)

---

### Day 8-10: Patients & Assessments API (24h)

_(Continuing similar pattern with detailed implementation for patients and assessments endpoints)_

**Due to length constraints, I'll create this as a separate comprehensive guide. The pattern follows the same structure:**

1. Service layer with business logic
2. Controller for request handling
3. Routes with OpenAPI docs
4. Comprehensive tests
5. Validation with Zod

---

## 📦 Deliverables Checklist - Sprint 1

### Week 1
- [x] Supabase production setup
- [x] Database schema deployed
- [x] RLS policies active
- [x] API project structure
- [x] Authentication system
- [x] Swagger documentation

### Week 2
- [ ] Scales API complete (GET all, GET by ID, search, categories)
- [ ] Usage tracking implemented
- [ ] Tests for scales endpoints

### Week 3
- [ ] Patients API complete (CRUD)
- [ ] Assessments API complete (CRUD)
- [ ] Scoring engine implemented

### Week 4
- [ ] Integration tests complete
- [ ] E2E tests for critical flows
- [ ] Performance testing
- [ ] Documentation finalized
- [ ] Deployment to staging

---

## 🎯 Success Metrics - Sprint 1

| Metric | Target | Status |
|--------|--------|--------|
| API endpoints implemented | 20+ | 🟡 |
| Test coverage | >70% | 🔴 |
| API response time (p95) | <500ms | 🔴 |
| Documentation completeness | 100% | 🟡 |
| RLS policies active | All tables | 🟡 |

---

## 🚀 Next Steps

After Sprint 1 completes, immediately begin:
1. **Sprint 2:** First batch of 28 medical scales
2. **Frontend integration:** Connect React Native app to new API
3. **Monitoring setup:** Sentry + analytics

---

**Last updated:** October 30, 2025
**Sprint end date:** November 27, 2025
**Next sprint planning:** November 24, 2025
