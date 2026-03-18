-- =====================================================
-- Super Administrator Role Implementation (Table-Based)
-- =====================================================
-- This migration adds super_admin role to the user_roles table
-- and updates RLS policies to restrict scale management
-- =====================================================

-- Ensure super_admin role exists in user_roles table
INSERT INTO user_roles (name, display_name, description)
VALUES ('super_admin', 'Super Admin', 'Super administrator with full system access')
ON CONFLICT (name) DO NOTHING;


-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to check if current user has a specific role
CREATE OR REPLACE FUNCTION has_role(required_role_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles p
        JOIN user_roles ur ON p.role_id = ur.id
        WHERE p.id = auth.uid() 
        AND ur.name = required_role_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN has_role('super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Update RLS Policies for Medical Scales
-- =====================================================
-- Only update if tables exist

DO $$ 
BEGIN
    -- Check if medical_scales table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'medical_scales') THEN
        -- Drop old permissive policies
        DROP POLICY IF EXISTS "Admin and practitioners can manage scales" ON medical_scales;
        DROP POLICY IF EXISTS "Practitioners can manage scales" ON medical_scales;

        -- Create new restrictive policy: ONLY super_admin can create/modify/delete scales
        EXECUTE 'CREATE POLICY "Only super admin can manage scales" ON medical_scales
            FOR ALL TO authenticated 
            USING (is_super_admin())
            WITH CHECK (is_super_admin())';
    END IF;
END $$;

-- =====================================================
-- Update RLS Policies for Scale Components
-- =====================================================

DO $$ 
BEGIN
    -- Scale Questions: Only super_admin can manage
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scale_questions') THEN
        DROP POLICY IF EXISTS "Admin can manage questions" ON scale_questions;
        DROP POLICY IF EXISTS "Practitioners can manage questions" ON scale_questions;

        EXECUTE 'CREATE POLICY "Only super admin can manage questions" ON scale_questions
            FOR ALL TO authenticated 
            USING (is_super_admin())
            WITH CHECK (is_super_admin())';
    END IF;

    -- Question Options: Only super_admin can manage
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'question_options') THEN
        DROP POLICY IF EXISTS "Admin can manage options" ON question_options;

        EXECUTE 'CREATE POLICY "Only super admin can manage options" ON question_options
            FOR ALL TO authenticated 
            USING (is_super_admin())
            WITH CHECK (is_super_admin())';
    END IF;

    -- Scale Scoring: Only super_admin can manage
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scale_scoring') THEN
        DROP POLICY IF EXISTS "Admin can manage scoring" ON scale_scoring;

        EXECUTE 'CREATE POLICY "Only super admin can manage scoring" ON scale_scoring
            FOR ALL TO authenticated 
            USING (is_super_admin())
            WITH CHECK (is_super_admin())';
    END IF;

    -- Scoring Ranges: Only super_admin can manage
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scoring_ranges') THEN
        DROP POLICY IF EXISTS "Admin can manage ranges" ON scoring_ranges;

        EXECUTE 'CREATE POLICY "Only super admin can manage scoring ranges" ON scoring_ranges
            FOR ALL TO authenticated 
            USING (is_super_admin())
            WITH CHECK (is_super_admin())';
    END IF;

    -- Scale References: Only super_admin can manage
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'scale_references') THEN
        DROP POLICY IF EXISTS "Admin can manage references" ON scale_references;

        EXECUTE 'CREATE POLICY "Only super admin can manage references" ON scale_references
            FOR ALL TO authenticated 
            USING (is_super_admin())
            WITH CHECK (is_super_admin())';
    END IF;
END $$;


-- =====================================================
-- Audit Logging for Scale Modifications
-- =====================================================

-- Function to log all scale modifications
CREATE OR REPLACE FUNCTION log_scale_modification()
RETURNS TRIGGER AS $$
DECLARE
    action_details JSONB;
BEGIN
    -- Build details based on operation
    IF TG_OP = 'DELETE' THEN
        action_details := jsonb_build_object(
            'scale_id', OLD.id,
            'scale_name', OLD.name,
            'action', 'DELETE'
        );
    ELSE
        action_details := jsonb_build_object(
            'scale_id', NEW.id,
            'scale_name', NEW.name,
            'action', TG_OP,
            'previous_version', CASE WHEN TG_OP = 'UPDATE' THEN OLD.version ELSE NULL END,
            'new_version', CASE WHEN TG_OP = 'UPDATE' THEN NEW.version ELSE NULL END
        );
    END IF;

    -- Insert audit log (only if security_audit_logs table exists)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'security_audit_logs') THEN
        INSERT INTO security_audit_logs (
            user_id,
            event_type,
            details,
            severity
        ) VALUES (
            auth.uid(),
            TG_OP || '_SCALE',
            action_details,
            2  -- warning level
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for medical_scales modifications (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'medical_scales') THEN
        DROP TRIGGER IF EXISTS tr_medical_scales_audit ON medical_scales;
        EXECUTE 'CREATE TRIGGER tr_medical_scales_audit
            AFTER INSERT OR UPDATE OR DELETE ON medical_scales
            FOR EACH ROW EXECUTE FUNCTION log_scale_modification()';
    END IF;
END $$;


-- =====================================================
-- Helpful Views
-- =====================================================

-- View to check who are the super admins in the system
-- Only create if profiles.role_id column exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'role_id'
    ) THEN
        EXECUTE 'CREATE OR REPLACE VIEW super_admin_users AS
        SELECT 
            p.id,
            p.full_name,
            p.institution,
            p.created_at,
            p.last_login_at
        FROM profiles p
        JOIN user_roles ur ON p.role_id = ur.id
        WHERE ur.name = ''super_admin''';
        
        -- Grant read access to authenticated users
        GRANT SELECT ON super_admin_users TO authenticated;
    END IF;
END $$;

-- =====================================================
-- Comments for Documentation
-- =====================================================

COMMENT ON FUNCTION has_role IS 'Security function to check if the current authenticated user has a specific role by name';
COMMENT ON FUNCTION is_super_admin IS 'Convenience function to check if current user is a super administrator';
COMMENT ON FUNCTION log_scale_modification IS 'Audit function that logs all modifications to medical scales for HIPAA compliance';
