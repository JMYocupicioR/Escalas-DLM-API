-- Add created_by to patients if missing (required for RLS and app queries)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'patients')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'patients' AND column_name = 'created_by') THEN
    -- Add column (nullable first to allow backfill)
    ALTER TABLE patients ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    -- Backfill existing rows with first user id
    UPDATE patients SET created_by = (SELECT id FROM auth.users ORDER BY created_at ASC LIMIT 1) WHERE created_by IS NULL;
    -- Enforce NOT NULL so new rows must have created_by
    IF NOT EXISTS (SELECT 1 FROM patients WHERE created_by IS NULL) THEN
      ALTER TABLE patients ALTER COLUMN created_by SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Ensure RLS policy exists for patients (created_by = auth.uid())
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own patients" ON patients;
CREATE POLICY "Users can read own patients" ON patients FOR SELECT TO authenticated
  USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create patients" ON patients;
CREATE POLICY "Users can create patients" ON patients FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Users can update own patients" ON patients;
CREATE POLICY "Users can update own patients" ON patients FOR UPDATE TO authenticated
  USING (created_by = auth.uid());
