/*
  # Fix Admin User Setup

  1. Changes
    - Drop and recreate admin user with proper configuration
    - Set proper auth settings
    - Remove generated column modifications
*/

-- Drop existing admin user if exists
DO $$ 
BEGIN
  DELETE FROM auth.users WHERE email = 'admin@yanbu.port';
EXCEPTION
  WHEN others THEN null;
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
  confirmation_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@yanbu.port',
  crypt('yanbu2025', gen_salt('bf')),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"admin"}',
  true,
  now(),
  now(),
  ''
);

-- Update auth settings
ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT now();
ALTER TABLE auth.users ALTER COLUMN is_sso_user SET DEFAULT false;