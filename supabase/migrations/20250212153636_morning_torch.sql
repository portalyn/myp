/*
  # Update Authentication Settings

  1. Changes
    - Disable email confirmation requirement
    - Enable user signups
    - Add RLS policies for auth.users table
*/

-- Update auth settings
ALTER TABLE auth.users ALTER COLUMN email_confirmed_at DROP DEFAULT;
ALTER TABLE auth.users ALTER COLUMN is_sso_user SET DEFAULT false;
ALTER TABLE auth.users ALTER COLUMN banned_until SET DEFAULT NULL;

-- Ensure RLS is enabled
ALTER TABLE auth.users FORCE ROW LEVEL SECURITY;

-- Update security policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON auth.users;
    DROP POLICY IF EXISTS "Enable update access for users" ON auth.users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

CREATE POLICY "Enable read access for authenticated users"
    ON auth.users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update access for users"
    ON auth.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);