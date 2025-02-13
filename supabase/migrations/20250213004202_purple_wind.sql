-- Create admin user if not exists
DO $$
DECLARE
  admin_uid UUID;
  hashed_password TEXT;
BEGIN
  -- Check if user already exists
  SELECT id INTO admin_uid
  FROM auth.users
  WHERE email = 'admin@yanbu.port';

  -- Create user if not exists
  IF admin_uid IS NULL THEN
    -- Generate hashed password using Supabase's auth.hash_password()
    hashed_password := auth.crypt('yanbu2025', auth.gen_salt('bf'));

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
      is_super_admin,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token,
      confirmed_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@yanbu.port',
      hashed_password,
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"role":"admin"}',
      true,
      NOW(),
      NOW(),
      '',
      '',
      '',
      '',
      NOW()
    );
  END IF;
END $$;