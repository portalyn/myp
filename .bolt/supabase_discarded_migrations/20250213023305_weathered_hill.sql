-- First, ensure we're using the correct schema
SET search_path = auth, public;

-- Drop existing admin user if exists
DO $$ 
BEGIN
  DELETE FROM auth.users WHERE email = 'admin@yanbu.port';
EXCEPTION
  WHEN undefined_table THEN NULL;
END $$;

-- Create admin user with proper configuration
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  confirmation_token,
  confirmed_at,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@yanbu.port',
  -- Using the correct password hashing method
  crypt('yanbu2025', gen_salt('bf', 10)),
  now(),
  now(),
  jsonb_build_object('provider', 'email', 'providers', array['email']),
  jsonb_build_object('role', 'admin'),
  true,
  now(),
  now(),
  '',
  now(),
  now(),
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  NULL,
  '',
  '',
  NULL,
  NULL,
  '',
  NULL
);

-- Ensure the user is properly confirmed and active
UPDATE auth.users 
SET 
  confirmed_at = now(),
  email_confirmed_at = now(),
  last_sign_in_at = now(),
  raw_app_meta_data = raw_app_meta_data || 
    jsonb_build_object(
      'provider', 'email',
      'providers', array['email']
    )::jsonb
WHERE email = 'admin@yanbu.port';

-- Set proper permissions
DO $$
BEGIN
  -- Ensure RLS is enabled
  ALTER TABLE auth.users FORCE ROW LEVEL SECURITY;
  
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON auth.users;
  DROP POLICY IF EXISTS "Enable update access for users" ON auth.users;
  
  -- Create new policies
  CREATE POLICY "Enable read access for authenticated users"
    ON auth.users FOR SELECT
    TO authenticated
    USING (true);
    
  CREATE POLICY "Enable update access for users"
    ON auth.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;