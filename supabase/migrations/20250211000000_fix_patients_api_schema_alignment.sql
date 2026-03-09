-- Fix patients table schema to align with API expectations
-- API expects: full_name, birth_date, email fields

-- Add missing columns that the API expects
ALTER TABLE patients 
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Add constraint for email format (with conditional check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_schema = 'public' 
    AND table_name = 'patients' 
    AND constraint_name = 'valid_patient_email'
  ) THEN
    ALTER TABLE patients 
    ADD CONSTRAINT valid_patient_email 
    CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients(full_name);
CREATE INDEX IF NOT EXISTS idx_patients_birth_date ON patients(birth_date);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);

-- Add comments for clarity
COMMENT ON COLUMN patients.full_name IS 'Patient full name (used by API)';
COMMENT ON COLUMN patients.birth_date IS 'Patient birth date (used by API for age calculation)';
COMMENT ON COLUMN patients.email IS 'Patient email address (optional, used by API)';