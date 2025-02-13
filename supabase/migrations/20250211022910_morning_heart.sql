/*
  # Create Vessels Table (Updated Requirements)

  1. Purpose
    - Create vessels table with correct data types
    - Allow crew count to be 0
    - Use date type for appointment

  2. Changes
    - Create vessels table with required columns
    - Set appointment as date type
    - Remove crew_count validation to allow 0
    - Set up RLS and policies

  3. Security
    - Enable RLS
    - Create policies for authenticated users
*/

-- Safely drop existing objects
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can read own vessels" ON vessels;
    DROP POLICY IF EXISTS "Users can insert own vessels" ON vessels;
    DROP POLICY IF EXISTS "Users can update own vessels" ON vessels;
    
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_vessels_updated_at ON vessels;
    
    -- Drop existing function if it exists
    DROP FUNCTION IF EXISTS update_vessels_updated_at();
    
    -- Drop existing table if it exists
    DROP TABLE IF EXISTS vessels;
EXCEPTION
    WHEN undefined_table THEN 
        NULL;
END $$;

-- Create vessels table
CREATE TABLE vessels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_name text NOT NULL,
  flag text NOT NULL,
  coming_from text NOT NULL,
  heading_to text NOT NULL,
  crew_count integer NOT NULL,
  appointment date NOT NULL,
  agent text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE vessels ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own vessels"
  ON vessels
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vessels"
  ON vessels
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vessels"
  ON vessels
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_vessels_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_vessels_updated_at
  BEFORE UPDATE ON vessels
  FOR EACH ROW
  EXECUTE FUNCTION update_vessels_updated_at();