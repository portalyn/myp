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
      confirmation_token,
      confirmed_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@yanbu.port',
      -- Using pgcrypto's crypt function directly with a known salt
      crypt('yanbu2025', '$2a$06$Rf2K1E5NFVs5ZZWQlpqgN.'),
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
  END IF;
END $$;

-- Ensure email confirmation is enabled by default
ALTER TABLE auth.users ALTER COLUMN email_confirmed_at SET DEFAULT now();

-- Enable RLS but allow all authenticated users to read
ALTER TABLE auth.users FORCE ROW LEVEL SECURITY;

-- Safely drop existing policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Enable read access for authenticated users" ON auth.users;
    DROP POLICY IF EXISTS "Enable update access for users" ON auth.users;
EXCEPTION
    WHEN undefined_object THEN null;
END $$;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
    ON auth.users FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable update access for users"
    ON auth.users FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);