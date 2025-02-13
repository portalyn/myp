-- Create admin user with proper configuration
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
  END IF;
END $$;