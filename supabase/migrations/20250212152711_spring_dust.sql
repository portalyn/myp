/*
  # Create Admin User

  1. Changes
    - Create admin user with full access
    - Set email and password
    - Enable user without email verification
*/

-- Create admin user if not exists
DO $$
DECLARE
  admin_uid UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO admin_uid
  FROM auth.users
  WHERE email = 'admin@yanbu.port';

  -- Create user if not exists
  IF admin_uid IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@yanbu.port',
      crypt('yanbu2025', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;