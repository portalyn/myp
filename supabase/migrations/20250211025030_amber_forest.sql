/*
  # Recreate vessels table with all required columns

  1. Changes
    - Recreate vessels table with all necessary columns including date and entered_by
    - Maintain all existing security policies and triggers
    - Ensure proper column constraints

  2. Security
    - Maintain RLS policies
    - Keep existing security model
*/

-- Safely drop existing objects
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can read own vessels" ON vessels;
    DROP POLICY IF EXISTS "Users can insert own vessels" ON vessels;
    DROP POLICY IF EXISTS "Users can update own vessels" ON vessels;
    DROP TRIGGER IF EXISTS update_vessels_updated_at ON vessels;
    DROP FUNCTION IF EXISTS update_vessels_updated_at();
    DROP TABLE IF EXISTS vessels;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- Create vessels table with all required columns
CREATE TABLE vessels (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    vessel_name text NOT NULL,
    flag text NOT NULL,
    coming_from text NOT NULL,
    heading_to text NOT NULL,
    crew_count integer NOT NULL CHECK (crew_count >= 0),
    appointment date NOT NULL,
    agent text NOT NULL,
    date date,
    entered_by text,
    user_id uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own vessels"
    ON vessels FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vessels"
    ON vessels FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vessels"
    ON vessels FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_vessels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vessels_updated_at
    BEFORE UPDATE ON vessels
    FOR EACH ROW
    EXECUTE FUNCTION update_vessels_updated_at();