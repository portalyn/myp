-- Create user with proper configuration
DO $$ 
DECLARE
  new_user_id uuid := gen_random_uuid();
  provider_id text := encode(gen_random_bytes(32), 'hex');
BEGIN
  -- Delete existing user if exists
  DELETE FROM auth.users WHERE email = 'naifjuhni@gmail.com';

  -- Insert new user with confirmed status
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
    recovery_token
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'naifjuhni@gmail.com',
    crypt('s9_HaSSVY9uBmP7', gen_salt('bf')),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"role":"admin"}'::jsonb,
    true,
    now(),
    now(),
    '',
    ''
  );

  -- Ensure identities are set up
  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    new_user_id,
    provider_id,
    format('{"sub":"%s","email":"%s","provider_id":"%s"}', new_user_id::text, 'naifjuhni@gmail.com', provider_id)::jsonb,
    'email',
    now(),
    now(),
    now()
  );
END $$;