-- Drop and recreate admin user with correct configuration
DO $$ 
BEGIN
  -- First, try to delete existing admin user if exists
  DELETE FROM auth.users WHERE email = 'admin@yanbu.port';
  
  -- Create admin user with proper password hash
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
    confirmed_at
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
    '',
    now()
  );

  -- Ensure the user is confirmed
  UPDATE auth.users 
  SET confirmed_at = now(),
      email_confirmed_at = now(),
      last_sign_in_at = now()
  WHERE email = 'admin@yanbu.port';
END $$;